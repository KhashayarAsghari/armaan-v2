import {
  mysqlTable,
  serial,
  varchar,
  text,
  longtext,
  timestamp,
  boolean,
  int,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'editor']).default('editor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = mysqlTable('posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: mysqlEnum('category', ['blog', 'article', 'news', 'tutorial'])
    .default('blog')
    .notNull(),
  authorId: int('author_id'),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const postTranslations = mysqlTable('post_translations', {
  id: serial('id').primaryKey(),
  postId: int('post_id').notNull(),
  locale: mysqlEnum('locale', ['fa', 'en', 'ar']).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  excerpt: text('excerpt'),
  content: longtext('content'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
});

export const postImages = mysqlTable('post_images', {
  id: serial('id').primaryKey(),
  postId: int('post_id'),
  filename: varchar('filename', { length: 255 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  size: int('size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contacts = mysqlTable('contacts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
