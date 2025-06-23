const StudyModel = require("../Models/Study Materials.Model");
const PendingResource = require("../Models/PendingResource.Model");
const AsyncHandler = require("../Utils/AsyncHandler");
const ApiError = require("../Utils/ApiError");
let key = "12345"
// Add resource to pending list
const getAllPendingResources = AsyncHandler(async (req, res) => {
    const SecretPass = String(req.headers.secretpass); // Read SecretPass from headers

    if (!SecretPass) {
        console.log("SecretPass is missing");
        return res.status(400).send("SecretPass is required");
    }

    if (SecretPass !== "12345") {
        console.log("Invalid SecretPass:", SecretPass);
        return res.status(403).send("Forbidden: Invalid SecretPass");
    }

    try {
        const resources = await PendingResource.find();
        // console.log('All Pending Resources:', resources);
        res.status(200).send(resources);
    } catch (error) {
        console.error('Error fetching pending resources:', error);
        res.status(500).send("Only valid admin can access");
    }
});

const Add_Resource = AsyncHandler(async (req, res) => {
    const { name, description, category, type, link, submittedBy } = req.body;

    if (!name || !description || !category || !type || !link || !submittedBy) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const newResource = await PendingResource.create({
            name,
            description,
            category,
            type,
            link,
            submittedBy
        });

        return res.status(201).json({
            success: true,
            data: newResource,
            message: "Resource submitted successfully"
        });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save resource"
        });
    }
});
// deleting Rejected Pending Request
const deletePendingResource = AsyncHandler(async (req, res) => {
    const SecretPass = req.headers.secretpass;

    if (!SecretPass || SecretPass != key) {
        return res.status(403).send("Forbidden: Invalid SecretPass");
    }

    const { id } = req.params;

    const resource = await PendingResource.findByIdAndDelete(id);

    if (!resource) {
        return res.status(404).send("Resource not found");
    }

    res.status(200).send({ message: "Resource successfully deleted" });
});

// Approved Request push
const approved_Data = AsyncHandler(async (req, res) => {
    try {
        console.log("approved_Data");
        const SecretPass = req.headers.secretpass;

        if (!SecretPass || SecretPass !== key) {
            return res.status(403).send("Forbidden: Invalid SecretPass");
        }

        const { id } = req.params;

        // Find the pending resource by ID
        const resource = await PendingResource.findById(id);
        console.log(resource);
        if (!resource) {
            console.log("!resource");
            return res.status(404).json({ message: 'Pending resource not found' });
        }

        // Create new Product data from the resource
        const productData = {
            name: resource.name,
            description: resource.description,
            category: resource.category,
            type: resource.type,
            // image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFD7ZMfgNMJ19tB66Kiacx8N4L08ynbJuVVw&s",
            link: resource.link
            // required by Product schema
        };

        // Save to Product collection
        const newProduct = new StudyModel(productData);
        await newProduct.save()

        // Delete the PendingResource (no need to update status before deletion)
        const resourceDelete = await PendingResource.findByIdAndDelete(id);

        if (!resourceDelete) {
            return res.status(404).send("Resource not found during delete");
        }

        res.status(200).json({ message: 'Resource approved, moved to Product, and removed from pending list.', product: newProduct });
    } catch (e) {
        console.error(e);
    }
});


// Fetch approved study materials
const Fetch_Data = AsyncHandler(async (req, res) => {
    try {
        const FindAllData = await StudyModel.find(); // You can filter by status if needed
        return res.status(200).json({
            success: true,
            message: "Resources found",
            data: FindAllData
        });
    } catch (error) {
        throw new ApiError("Invalid DB Credentials!", 404);
    }
});

module.exports = { Fetch_Data, Add_Resource, getAllPendingResources, deletePendingResource, approved_Data };
