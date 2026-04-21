import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category/categoryDto";
import { NotFoundError, ExistsAlready } from "../errors/appErrors";
import { createServiceLogger } from "../utils/serviceLogger";
import {categoryRepository} from "../repository";

const logger = createServiceLogger("CategoriesService");

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getAllCategories = async (limit: number = 10, offset: number = 0) => {
    logger.info("Get all categories", { limit, offset });

    const [totalCountResult] = await categoryRepository.countCategories();
    const total = Number(totalCountResult.count);
    
    const data = await categoryRepository.findAllCategories(limit, offset);
    
    return { data, total };
}

export const getCategoryById = async (id: number) => {
    logger.info("Get category by id", { categoryId: id });

    const category = await categoryRepository.findCategoryById(id);
    if (!category) {
        logger.warn("Get category by id failed: not found", { categoryId: id });
        throw new NotFoundError("Category not found");
    }
    return category;
}

export const createCategory = async (dto: CreateCategoryDto) => {
    logger.info("Create category started", { name: dto.name });

    const slug = generateSlug(dto.name);
    
    const existing = await categoryRepository.findCategoryBySlug(slug);
    if (existing) {
        logger.warn("Create category failed: duplicate slug", { slug, name: dto.name });
        throw new ExistsAlready("Category with this name already exists");
    }

    const [result] = await categoryRepository.insertCategory({
        name: dto.name,
        slug,
        description: dto.description
    });

    return {
        categoryId: result.insertId,
        name: dto.name,
        slug,
        description: dto.description
    };
}

export const updateCategory = async (id: number, dto: UpdateCategoryDto) => {
    logger.info("Update category started", { categoryId: id });

    const category = await getCategoryById(id);
    
    const updateData: any = { ...dto };
    if (dto.name) {
        updateData.slug = generateSlug(dto.name);
        if (updateData.slug !== category.slug) {
            const existing = await categoryRepository.findCategoryBySlug(updateData.slug);
            if (existing) {
                logger.warn("Update category failed: duplicate slug", { categoryId: id, slug: updateData.slug });
                throw new ExistsAlready("Category with this name already exists");
            }
        }
    }

    await categoryRepository.updateCategoryById(id, updateData);

    return { ...category, ...updateData };
}

export const deleteCategory = async (id: number) => {
    logger.info("Delete category started", { categoryId: id });

    await getCategoryById(id); // throws if not found
    await categoryRepository.deleteCategoryById(id);
    return { success: true };
}