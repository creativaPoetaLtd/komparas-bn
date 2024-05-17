"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.deleteCategory = exports.addCategory = exports.getCategoryByNameOrID = exports.getParentCategories = exports.getAllCategories = void 0;
const category_1 = __importDefault(require("../../models/category"));
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_1.default.find().populate('children');
        res.status(200).json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllCategories = getAllCategories;
const getParentCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentCategories = yield category_1.default.find({ parent_id: null }).populate('children');
        res.status(200).json(parentCategories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getParentCategories = getParentCategories;
const getCategoryByNameOrID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const categoryToFind = yield category_1.default.findById(category).populate('children');
        if (!categoryToFind) {
            const categoryByName = yield category_1.default.findOne({ name: category }).populate('children');
            if (!categoryByName) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json(categoryByName);
            return;
        }
        res.status(200).json(categoryToFind);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryByNameOrID = getCategoryByNameOrID;
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, parent_id } = req.body;
        const existingCategory = yield category_1.default.findOne({ name });
        if (existingCategory) {
            res.status(400).json({ message: 'Category with the same name already exists' });
            return;
        }
        let category;
        if (parent_id) {
            const parentCategory = yield category_1.default.findById(parent_id);
            if (!parentCategory) {
                res.status(400).json({ message: 'Parent category does not exist' });
                return;
            }
            category = new category_1.default({ name, parent_id });
            if (!parentCategory.children) {
                parentCategory.children = [];
            }
            parentCategory.children.push(category._id);
            yield parentCategory.save();
        }
        else {
            category = new category_1.default({ name });
        }
        yield category.save();
        res.status(201).json({ message: 'Category added successfully', category });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addCategory = addCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { category_id } = req.params;
        if (!category_id) {
            res.status(400).json({ message: 'Invalid category ID' });
            return;
        }
        const categoryToDelete = yield category_1.default.findById(category_id);
        if (!categoryToDelete) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        if (categoryToDelete.children && categoryToDelete.children.length > 0) {
            res.status(400).json({ message: 'Cannot delete a category with children. Delete the children first.' });
            return;
        }
        if (categoryToDelete.parent_id) {
            const parentCategory = yield category_1.default.findById(categoryToDelete.parent_id);
            if (parentCategory) {
                parentCategory.children = (_b = (_a = parentCategory === null || parentCategory === void 0 ? void 0 : parentCategory.children) === null || _a === void 0 ? void 0 : _a.filter(childId => childId.toString() !== category_id)) !== null && _b !== void 0 ? _b : [];
                yield parentCategory.save();
            }
        }
        yield categoryToDelete.deleteOne();
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const { category_id } = req.params;
        const { name, parent_id } = req.body;
        if (!category_id) {
            res.status(400).json({ message: 'Invalid category ID' });
            return;
        }
        const categoryToUpdate = yield category_1.default.findById(category_id);
        if (!categoryToUpdate) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        if (name && name !== categoryToUpdate.name) {
            const existingCategory = yield category_1.default.findOne({ name });
            if (existingCategory) {
                res.status(400).json({ message: 'Category with the same name already exists' });
                return;
            }
        }
        if (parent_id) {
            const parentCategory = yield category_1.default.findById(parent_id);
            if (!parentCategory) {
                res.status(400).json({ message: 'Parent category does not exist' });
                return;
            }
            if ((categoryToUpdate === null || categoryToUpdate === void 0 ? void 0 : categoryToUpdate.parent_id) !== parent_id) {
                const oldParentCategory = yield (category_1.default === null || category_1.default === void 0 ? void 0 : category_1.default.findById(categoryToUpdate === null || categoryToUpdate === void 0 ? void 0 : categoryToUpdate.parent_id));
                if (oldParentCategory) {
                    oldParentCategory.children = (_c = oldParentCategory === null || oldParentCategory === void 0 ? void 0 : oldParentCategory.children) === null || _c === void 0 ? void 0 : _c.filter(childId => (childId === null || childId === void 0 ? void 0 : childId.toString()) !== category_id);
                    yield (oldParentCategory === null || oldParentCategory === void 0 ? void 0 : oldParentCategory.save());
                }
                parentCategory.children = (_d = parentCategory.children) !== null && _d !== void 0 ? _d : [];
                parentCategory === null || parentCategory === void 0 ? void 0 : parentCategory.children.push(categoryToUpdate._id);
                yield parentCategory.save();
                categoryToUpdate.parent_id = parent_id;
            }
        }
        if (name) {
            categoryToUpdate.name = name;
        }
        yield categoryToUpdate.save();
        res.status(200).json({ message: 'Category updated successfully', category: categoryToUpdate });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCategory = updateCategory;
