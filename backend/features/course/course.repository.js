import pool from '../../database/database.js';

const getCourseBaseQuery = () => pool('courses as c')
    .select(
        'c.*',
        pool.raw('COUNT(DISTINCT e.id) AS enrolled_students'),
        pool.raw('COUNT(DISTINCT w.id) AS wishlist_count')
    )
    .leftJoin('enrollment as e', 'e.course_id', 'c.id')
    .leftJoin('wishlist as w', 'w.course_id', 'c.id');

export const addCourseInDB = async (data) => {
    const [insertId] = await pool('courses').insert({
        author: data.author,
        category: data.category,
        price: data.price,
        subtitle: data.subtitle,
        thumb_url: data.thumb_url,
        title: data.title,
        rating: data.rating ?? 0,
        owner_user_id: data.owner_user_id ?? null
    });
    return { insertId };
};

export const courseByUserId = async (id) => {
    return pool('courses as c')
        .select(
            'c.*',
            'e.id as enrollment_id',
            pool.raw('COALESCE(e.progress, 0) AS progress'),
            'e.is_completed',
            pool.raw('(SELECT COUNT(*) FROM lesson l WHERE l.course_id = c.id) AS total_lessons'),
            pool.raw('(SELECT COUNT(*) FROM enroll_progress ep WHERE ep.enrollment_id = e.id) AS completed_lessons')
        )
        .join('enrollment as e', 'c.id', 'e.course_id')
        .where('e.user_id', id)
        .groupBy('e.id')
        .orderBy('e.created_at', 'desc');
};

export const allCourses = async (filters = {}) => {
    const {
        limit = 20,
        offset = 0,
        sortBy = 'newest'
    } = filters;

    const query = getCourseBaseQuery();

    if (filters.category) {
        query.where('c.category', filters.category);
    }
    if (Number.isFinite(filters.minPrice)) {
        query.where('c.price', '>=', filters.minPrice);
    }
    if (Number.isFinite(filters.maxPrice)) {
        query.where('c.price', '<=', filters.maxPrice);
    }
    if (Number.isFinite(filters.minRating)) {
        query.where('c.rating', '>=', filters.minRating);
    }
    if (filters.search) {
        const searchValue = `%${filters.search}%`;
        query.where((builder) => {
            builder.where('c.title', 'like', searchValue)
                .orWhere('c.author', 'like', searchValue)
                .orWhere('c.category', 'like', searchValue)
                .orWhere('c.subtitle', 'like', searchValue);
        });
    }

    const totalQuery = pool('courses as c');
    if (filters.category) {
        totalQuery.where('c.category', filters.category);
    }
    if (Number.isFinite(filters.minPrice)) {
        totalQuery.where('c.price', '>=', filters.minPrice);
    }
    if (Number.isFinite(filters.maxPrice)) {
        totalQuery.where('c.price', '<=', filters.maxPrice);
    }
    if (Number.isFinite(filters.minRating)) {
        totalQuery.where('c.rating', '>=', filters.minRating);
    }
    if (filters.search) {
        const searchValue = `%${filters.search}%`;
        totalQuery.where((builder) => {
            builder.where('c.title', 'like', searchValue)
                .orWhere('c.author', 'like', searchValue)
                .orWhere('c.category', 'like', searchValue)
                .orWhere('c.subtitle', 'like', searchValue);
        });
    }

    const totalRow = await totalQuery.count('* as count').first();

    if (sortBy === 'price_asc') {
        query.orderBy('c.price', 'asc').orderBy('c.id', 'desc');
    } else if (sortBy === 'price_desc') {
        query.orderBy('c.price', 'desc').orderBy('c.id', 'desc');
    } else if (sortBy === 'rating_desc') {
        query.orderBy('c.rating', 'desc').orderBy('c.id', 'desc');
    } else {
        query.orderBy('c.id', 'desc');
    }

    const courses = await query
        .groupBy('c.id')
        .limit(limit)
        .offset(offset);

    return { courses, total: totalRow.count };
};

export const courseById = async (id) => {
    return getCourseBaseQuery()
        .where('c.id', id)
        .groupBy('c.id')
        .first();
};

export const tutorByCourseId = async (id) => {
    return pool('users as u')
        .select('u.id', 'u.full_name', 'u.email')
        .join('enrollment as e', 'u.id', 'e.user_id')
        .where('e.course_id', id)
        .where('u.user_role', 'Tutor')
        .first();
};

export const getFeaturedCourses = async (limit = 6) => {
    return getCourseBaseQuery()
        .groupBy('c.id')
        .orderBy('c.rating', 'desc')
        .orderBy('enrolled_students', 'desc')
        .orderBy('wishlist_count', 'desc')
        .orderBy('c.id', 'desc')
        .limit(limit);
};

export const getRelatedCourses = async (courseId, limit = 4) => {
    return getCourseBaseQuery()
        .where('c.category', function() {
            this.select('category').from('courses').where('id', courseId);
        })
        .whereNot('c.id', courseId)
        .groupBy('c.id')
        .orderBy('c.rating', 'desc')
        .orderBy('enrolled_students', 'desc')
        .orderBy('c.id', 'desc')
        .limit(limit);
};
