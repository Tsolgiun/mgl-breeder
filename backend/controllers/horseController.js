import asyncHandler from 'express-async-handler';
import Horse from '../models/horseModel.js';
import mongoose from 'mongoose';

const DEFAULT_HORSE_IMAGE = 'https://mglbreeder.s3.amazonaws.com/placeholder/horse-placeholder.png';

// Pedigree management helper functions
const relationshipManagement = {
  async validateParentChild(parentId, childId) {
    if (!parentId || !childId) return true;
    
    const [parent, child] = await Promise.all([
      Horse.findById(parentId),
      Horse.findById(childId)
    ]);

    if (!parent || !child) {
      throw new Error('Parent or child horse not found');
    }

    if (parent.birthDate >= child.birthDate) {
      throw new Error('Parent must be born before offspring');
    }

    return true;
  },

  async updateParentage(session, horseId, { sireId, damId }) {
    const updates = [];
    
    // Remove horse from old parents' offspring lists if needed
    const currentHorse = await Horse.findById(horseId);
    if (currentHorse.parentage.sire && currentHorse.parentage.sire.toString() !== sireId) {
      updates.push(
        Horse.findByIdAndUpdate(
          currentHorse.parentage.sire,
          { $pull: { offspring: horseId } },
          { session }
        )
      );
    }
    if (currentHorse.parentage.dam && currentHorse.parentage.dam.toString() !== damId) {
      updates.push(
        Horse.findByIdAndUpdate(
          currentHorse.parentage.dam,
          { $pull: { offspring: horseId } },
          { session }
        )
      );
    }

    // Add horse to new parents' offspring lists
    if (sireId) {
      await this.validateParentChild(sireId, horseId);
      updates.push(
        Horse.findByIdAndUpdate(
          sireId,
          { $addToSet: { offspring: horseId } },
          { session }
        )
      );
    }
    if (damId) {
      await this.validateParentChild(damId, horseId);
      updates.push(
        Horse.findByIdAndUpdate(
          damId,
          { $addToSet: { offspring: horseId } },
          { session }
        )
      );
    }

    // Update horse's parentage
    updates.push(
      Horse.findByIdAndUpdate(
        horseId,
        {
          'parentage.sire': sireId || null,
          'parentage.dam': damId || null
        },
        { session, new: true }
      )
    );

    return Promise.all(updates);
  }
};

// @desc    Get all horses
// @route   GET /api/horses
// @access  Public
const getHorses = asyncHandler(async (req, res) => {
  const horses = await Horse.find({});
  res.json(horses);
});

// @desc    Get single horse by ID with family info
// @route   GET /api/horses/:id
// @access  Public
const getHorseById = asyncHandler(async (req, res) => {
  const horse = await Horse.findById(req.params.id)
    .populate('parentage.sire', 'name color registrationNumber')
    .populate('parentage.dam', 'name color registrationNumber')
    .populate('offspring', 'name color registrationNumber');
  
  if (horse) {
    res.json(horse);
  } else {
    res.status(404);
    throw new Error('Horse not found');
  }
});

// @desc    Create a horse
// @route   POST /api/horses
// @access  Private
const createHorse = asyncHandler(async (req, res) => {
  const horse = new Horse({
    ...req.body,
    imageUrl: req.file ? req.file.location : DEFAULT_HORSE_IMAGE
  });

  const createdHorse = await horse.save();
  res.status(201).json(createdHorse);
});

// @desc    Update a horse
// @route   PUT /api/horses/:id
// @access  Private
const updateHorse = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const horse = await Horse.findById(req.params.id);

    if (!horse) {
      res.status(404);
      throw new Error('Horse not found');
    }

    // Update basic info
    horse.name = req.body.name || horse.name;
    horse.birthDate = req.body.birthDate || horse.birthDate;
    horse.birthPlace = req.body.birthPlace || horse.birthPlace;
    horse.registrationNumber = req.body.registrationNumber || horse.registrationNumber;
    horse.microchip = req.body.microchip || horse.microchip;
    horse.brand = req.body.brand || horse.brand;
    horse.color = req.body.color || horse.color;
    horse.owner = req.body.owner || horse.owner;
    horse.breeder = req.body.breeder || horse.breeder;
    horse.registrationDate = req.body.registrationDate || horse.registrationDate;
    
    horse.imageUrl = req.file ? req.file.location : horse.imageUrl;

    // Update parentage if provided
    if (req.body.sireId !== undefined || req.body.damId !== undefined) {
      await relationshipManagement.updateParentage(session, horse._id, {
        sireId: req.body.sireId,
        damId: req.body.damId
      });
    }

    const updatedHorse = await horse.save({ session });
    await session.commitTransaction();

    // Fetch the updated horse with populated relationships
    const populatedHorse = await Horse.findById(updatedHorse._id)
      .populate('parentage.sire', 'name color registrationNumber')
      .populate('parentage.dam', 'name color registrationNumber')
      .populate('offspring', 'name color registrationNumber');

    res.json(populatedHorse);
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Delete a horse
// @route   DELETE /api/horses/:id
// @access  Private
const deleteHorse = asyncHandler(async (req, res) => {
  const horse = await Horse.findById(req.params.id);

  if (horse) {
    await horse.deleteOne();
    res.json({ message: 'Horse removed' });
  } else {
    res.status(404);
    throw new Error('Horse not found');
  }
});

// @desc    Get horse pedigree
// @route   GET /api/horses/:id/pedigree
// @access  Public
const getHorsePedigree = asyncHandler(async (req, res) => {
  const generations = parseInt(req.query.generations) || 4;
  
  const getPedigreeRecursive = async (id, level) => {
    if (!id || level >= generations) return null;

    const horse = await Horse.findById(id)
      .select('name color registrationNumber birthDate parentage')
      .populate({
        path: 'parentage.sire',
        select: 'name color registrationNumber birthDate parentage'
      })
      .populate({
        path: 'parentage.dam',
        select: 'name color registrationNumber birthDate parentage'
      })
      .lean();

    if (!horse) return null;

    // Extract the sire and dam from parentage
    const sire = horse.parentage?.sire;
    const dam = horse.parentage?.dam;

    // Remove parentage from the horse object
    const { parentage, ...horseData } = horse;

    return {
      ...horseData,
      sire: sire ? {
        _id: sire._id,
        name: sire.name,
        color: sire.color,
        registrationNumber: sire.registrationNumber,
        birthDate: sire.birthDate,
        ...(await getPedigreeRecursive(sire._id, level + 1))
      } : null,
      dam: dam ? {
        _id: dam._id,
        name: dam.name,
        color: dam.color,
        registrationNumber: dam.registrationNumber,
        birthDate: dam.birthDate,
        ...(await getPedigreeRecursive(dam._id, level + 1))
      } : null
    };
  };

  const pedigree = await getPedigreeRecursive(req.params.id, 0);
  
  if (pedigree) {
    res.json(pedigree);
  } else {
    res.status(404);
    throw new Error('Horse not found');
  }
});

// @desc    Get horse descendants
// @route   GET /api/horses/:id/descendants
// @access  Public
const getHorseDescendants = asyncHandler(async (req, res) => {
  const generations = parseInt(req.query.generations) || 4;

  const getDescendantsRecursive = async (id, level) => {
    if (!id || level >= generations) return null;

    const horse = await Horse.findById(id)
      .select('name color registrationNumber birthDate offspring');

    if (!horse) return null;

    const descendants = await Promise.all(
      horse.offspring.map(offspringId => 
        getDescendantsRecursive(offspringId, level + 1)
      )
    );

    return {
      _id: horse._id,
      name: horse.name,
      color: horse.color,
      registrationNumber: horse.registrationNumber,
      birthDate: horse.birthDate,
      offspring: descendants.filter(d => d !== null)
    };
  };

  const descendants = await getDescendantsRecursive(req.params.id, 0);
  
  if (descendants) {
    res.json(descendants);
  } else {
    res.status(404);
    throw new Error('Horse not found');
  }
});

export {
  getHorses,
  getHorseById,
  createHorse,
  updateHorse,
  deleteHorse,
  getHorsePedigree,
  getHorseDescendants
};
