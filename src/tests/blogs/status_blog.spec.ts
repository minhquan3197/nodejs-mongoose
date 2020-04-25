import request from 'supertest';

import app from '../../app';
import { transErrors, transSuccess } from '../../lang/en';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';
import { connectDB } from '../../config/connect_database';
import { DatabaseService } from '../../services/database.service';
import { CategoryService } from '../../services/category.service';
connectDB();

describe('GET /api/v1/blogs/status/:id', () => {
    let token: string;
    let blogId: string;
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
        const blog = await BlogService.createBlog({
            name: 'test',
            content: 'test_content',
            image: 'test_image',
            category_id: category.id,
        });
        token = 'Bearer ' + user;
        blogId = blog.id;
    });

    it('Can change status blog', async () => {
        const result: any = await request(app).get(`/api/v1/blogs/status/${blogId}`).set('Authorization', token);
        const { status, result_code, message } = result.body;
        expect(result_code).toBe(200);
        expect(message).toBe(transSuccess.system.success);
        expect(status).toBe(true);
        const blog: any = await BlogService.detailBlog(blogId, {});
        expect(blog.status).toBe(true);
    });

    it('Cannot change status blog without token', async () => {
        const result: any = await request(app).get(`/api/v1/blogs/status/${blogId}`);
        expect(result.status).toBe(401);
    });

    it('Cannot change status blog with wrong blog id', async () => {
        const result: any = await request(app).get(`/api/v1/blogs/status/${blogId}123`).set('Authorization', token);
        const { status, result_code, message, data } = result.body;
        expect(result_code).toBe(400);
        expect(message).toBe(transErrors.system.object_id_invalid);
        expect(data).toBeNull();
        expect(status).toBe(false);
    });

    it('Cannot change status blog with wrong blog id not found', async () => {
        const result: any = await request(app)
            .get(`/api/v1/blogs/status/5e9c48cf181e950bc8c3eead`)
            .set('Authorization', token);
        const { status, result_code, message, data } = result.body;
        expect(result_code).toBe(400);
        expect(message).toBe(transErrors.blog.not_found);
        expect(data).toBeNull();
        expect(status).toBe(false);
    });
});
