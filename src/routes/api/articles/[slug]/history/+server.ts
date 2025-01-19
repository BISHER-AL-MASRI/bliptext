import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { articles, revisions, user } from '$lib/server/db/schema';
import { eq, desc, and, lt } from 'drizzle-orm';

export async function GET({ params, url }) {
    const { slug } = params;
    const cursor = url.searchParams.get('cursor');
    const limit = 50;

    try {
        const article = await db.query.articles.findFirst({
            where: eq(articles.slug, slug)
        });

        if (!article) {
            throw error(404, 'Article not found');
        }

        const whereClause = cursor
            ? and(
                eq(revisions.articleId, article.id),
                lt(revisions.createdAt, new Date(cursor))
            )
            : eq(revisions.articleId, article.id);

        const history = await db
            .select({
                id: revisions.id,
                wordChanged: revisions.wordChanged,
                newWord: revisions.content,
                wordIndex: revisions.wordIndex,
                createdAt: revisions.createdAt,
                user: {
                    id: user.id,
                    name: user.name,
                    image: user.image
                }
            })
            .from(revisions)
            .leftJoin(user, eq(revisions.createdBy, user.id))
            .where(whereClause)
            .orderBy(desc(revisions.createdAt))
            .limit(limit + 1); // one extra to check if there are more

        const hasMore = history.length > limit;
        const items = history.slice(0, limit);
        const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

        return json({
            history: items,
            article,
            hasMore,
            nextCursor
        });
    } catch (err) {
        console.error('Error fetching history:', err);
        throw error(500, 'Failed to fetch history');
    }
}
