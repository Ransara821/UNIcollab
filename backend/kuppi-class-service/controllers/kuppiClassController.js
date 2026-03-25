const KuppiClass = require('../models/KuppiClass');

// Create a new kuppi class
const createKuppiClass = async (req, res) => {
    try {
        const { title, module, description, location, deadline, postedBy } = req.body;

        if (!title || !module) {
            return res.status(400).json({ message: "Title and module are required." });
        }

        const newKuppiClass = new KuppiClass({
            title,
            module,
            description,
            location,
            deadline,
            postedBy
        });

        const savedKuppiClass = await newKuppiClass.save();
        res.status(201).json(savedKuppiClass);
    } catch (error) {
        res.status(500).json({ message: "Failed to create Kuppi class", error: error.message });
    }
};

// Get all kuppi classes
const getAllKuppiClasses = async (req, res) => {
    try {
        const kuppiClasses = await KuppiClass.find().sort({ createdAt: -1 });
        res.status(200).json(kuppiClasses);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Kuppi classes", error: error.message });
    }
};

// Get a single kuppi class by ID
const getKuppiClassById = async (req, res) => {
    try {
        const kuppiClass = await KuppiClass.findById(req.params.id);
        if (!kuppiClass) {
            return res.status(404).json({ message: "Kuppi class not found" });
        }
        res.status(200).json(kuppiClass);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Kuppi class", error: error.message });
    }
};

// Update a kuppi class
const updateKuppiClass = async (req, res) => {
    try {
        const updatedKuppiClass = await KuppiClass.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedKuppiClass) {
            return res.status(404).json({ message: "Kuppi class not found" });
        }
        res.status(200).json(updatedKuppiClass);
    } catch (error) {
        res.status(500).json({ message: "Failed to update Kuppi class", error: error.message });
    }
};

// Delete a kuppi class
const deleteKuppiClass = async (req, res) => {
    try {
        const deletedKuppiClass = await KuppiClass.findByIdAndDelete(req.params.id);
        if (!deletedKuppiClass) {
            return res.status(404).json({ message: "Kuppi class not found" });
        }
        res.status(200).json({ message: "Kuppi class deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete Kuppi class", error: error.message });
    }
};

module.exports = {
    createKuppiClass,
    getAllKuppiClasses,
    getKuppiClassById,
    updateKuppiClass,
    deleteKuppiClass
};
