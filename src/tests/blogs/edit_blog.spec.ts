import request from 'supertest';

import app from '../../app';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';
import { connectDB } from '../../config/connect_database';
import { DatabaseService } from '../../services/database.service';
import { CategoryService } from '../../services/category.service';
import { transValidation, transErrors, transSuccess } from '../../lang/en';
connectDB();

describe('PUT /api/v1/blogs/:id', () => {
    let token: string;
    let blogId: string;
    let categoryId: string;
    beforeEach(async () => {
        await DatabaseService.refreshDatabaseForTesting();
        await AuthService.register({
            name: 'Quan Nguyen',
            username: 'username_test',
            password: 'password_test',
            password_confirmation: 'password_test',
        });
        const user = await AuthService.login({
            username: 'username_test',
            password: 'password_test',
        });
        const category = await CategoryService.createCategory({
            name: 'test category',
        });
        const category_2 = await CategoryService.createCategory({
            name: 'test category 2',
        });
        const blog = await BlogService.createBlog({
            name: 'test',
            content: 'test_content',
            image: 'test_image',
            category_id: category.id,
        });
        token = 'Bearer ' + user;
        blogId = blog.id;
        categoryId = category_2.id;
    });

    it('Can update blog', async () => {
        const result: any = await request(app)
            .put(`/api/v1/blogs/${blogId}`)
            .send({
                name: 'test_2',
                content: 'content_test_2',
                image: 'image_test_2',
                category_id: categoryId,
            })
            .set('Authorization', token);
        const { status, result_code, message } = result.body;
        expect(result_code).toBe(200);
        expect(message).toBe(transSuccess.blog.blog_updated('test'));
        expect(status).toBe(true);
        const blog: any = await BlogService.detailBlog(blogId, {});
        expect(blog.content).toBe('content_test_2');
        expect(blog.name).toBe('test_2');
        expect(blog.image).toBe('image_test_2');
    });

    it('Cannot update blog without request body', async () => {
        const result: any = await request(app)
            .put(`/api/v1/blogs/${blogId}`)
            .send({
                name: '',
                content: '',
                image: '',
                category_id: '',
            })
            .set('Authorization', token);
        const { status, result_code, message, data } = result.body;
        expect(result_code).toBe(400);
        expect(message).toEqual({
            name: transValidation.blog.name_incorrect,
            content: transValidation.blog.content_incorrect,
            image: transValidation.blog.image_incorrect,
            category_id: transValidation.blog.category_incorrect,
        });
        expect(data).toBeNull();
        expect(status).toBe(false);
    });

    it('Cannot update blog with wrong blog id', async () => {
        const result: any = await request(app)
            .put(`/api/v1/blogs/${blogId}123`)
            .send({
                name: 'test_2',
                content: 'content_test_2',
                image: 'image_test_2',
                category_id: categoryId,
            })
            .set('Authorization', token);
        const { status, result_code, message, data } = result.body;
        expect(result_code).toBe(400);
        expect(message).toBe(transErrors.system.object_id_invalid);
        expect(data).toBeNull();
        expect(status).toBe(false);
    });

    it('Cannot update blog with wrong blog id not found', async () => {
        const result: any = await request(app)
            .put(`/api/v1/blogs/5e9c48cf181e950bc8c3eead`)
            .send({
                name: 'test_2',
                content: 'content_test_2',
                image: 'image_test_2',
                category_id: categoryId,
            })
            .set('Authorization', token);
        const { status, result_code, message, data } = result.body;
        expect(result_code).toBe(400);
        expect(message).toBe(transErrors.blog.not_found);
        expect(data).toBeNull();
        expect(status).toBe(false);
    });

    it('Cannot update blog without token', async () => {
        const result: any = await request(app).put(`/api/v1/blogs/${blogId}`).send({
            name: 'test',
            content: 'content_test',
            image: 'image_test',
            category_id: categoryId,
        });
        expect(result.status).toBe(401);
    });
});
