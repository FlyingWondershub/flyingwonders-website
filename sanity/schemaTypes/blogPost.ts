export const blogPostSchema = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule: any) => Rule.required() },
    { name: 'category', title: 'Category', type: 'string', options: { list: [
        { title: '🏛️ Sightseeing', value: 'sightseeing' },
        { title: '🍜 Food & Dining', value: 'food' },
        { title: '🏨 Hotels & Stays', value: 'hotels' },
        { title: '💡 Travel Hacks', value: 'travel_hacks' },
        { title: '💎 Hidden Gems', value: 'hidden_gems' },
        { title: '👨‍👩‍👧 Family Travel', value: 'family' },
        { title: '📸 Photography & Nightlife', value: 'photo_night' }
      ] }, validation: (Rule: any) => Rule.required() },
    { name: 'author', title: 'Author', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'date', title: 'Publish Date', type: 'date', validation: (Rule: any) => Rule.required() },
    { name: 'readTime', title: 'Read Time', type: 'string' },
    { name: 'imageUrl', title: 'Cover Image URL', type: 'url', validation: (Rule: any) => Rule.required() },
    { name: 'excerpt', title: 'Excerpt', type: 'text', validation: (Rule: any) => Rule.required() },
    { name: 'content', title: 'Content (Markdown)', type: 'text', validation: (Rule: any) => Rule.required() },
    { name: 'isFeatured', title: 'Featured', type: 'boolean', initialValue: false },
    { name: 'isPublished', title: 'Published', type: 'boolean', initialValue: true },
    { name: 'viewCount', title: 'View Count', type: 'number', initialValue: 0 },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'seoDescription', title: 'SEO Description', type: 'text' }
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', isPublished: 'isPublished' },
    prepare(selection: { title: string; subtitle: string; isPublished: boolean }) {
      const { title, subtitle, isPublished } = selection;
      const status = isPublished ? '✅' : '🚫';
      return { title: `${status} ${title}`, subtitle: `Category: ${subtitle}` };
    }
  }
};
