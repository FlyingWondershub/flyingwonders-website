import { defineField, defineType } from 'sanity'

export const studyCourseCategorySchema = defineType({
  name: 'studyCourseCategory',
  title: 'Study - Course Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Course Category Name',
      type: 'string',
      description: 'e.g., Business & Management, IT & Computer Science',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Brief Description',
      type: 'text',
    }),
    defineField({
      name: 'blogUrl',
      title: 'Related Blog/Article URL',
      type: 'string',
      description: 'e.g., /blogs/Study-the-World-of-Business-management-in-singapore',
    }),
  ],
})
