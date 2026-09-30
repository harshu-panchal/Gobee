import LegalPage from '../models/legalPage.js';
import { handleResponse } from '../utils/helper.js';

const PANELS = ['customer', 'seller', 'delivery'];
const TYPES = ['privacy', 'support'];

const defaultTitle = (type) => (type === 'privacy' ? 'Privacy Policy' : 'Support');

export const getPublicLegalPage = async (req, res) => {
    try {
        const { panel, type } = req.query;

        if (!PANELS.includes(panel) || !TYPES.includes(type)) {
            return handleResponse(res, 400, 'Invalid panel or type');
        }

        const page = await LegalPage.findOne({ panel, type }).lean();

        if (!page) {
            return handleResponse(res, 200, 'Legal page fetched successfully', {
                panel,
                type,
                title: defaultTitle(type),
                content: ''
            });
        }

        return handleResponse(res, 200, 'Legal page fetched successfully', page);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

export const listLegalPages = async (req, res) => {
    try {
        const existing = await LegalPage.find({}).lean();
        const existingMap = new Map(existing.map((doc) => [`${doc.panel}:${doc.type}`, doc]));

        const items = [];
        for (const panel of PANELS) {
            for (const type of TYPES) {
                const key = `${panel}:${type}`;
                items.push(
                    existingMap.get(key) || {
                        panel,
                        type,
                        title: defaultTitle(type),
                        content: ''
                    }
                );
            }
        }

        return handleResponse(res, 200, 'Legal pages fetched successfully', items);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

export const upsertLegalPage = async (req, res) => {
    try {
        const { panel, type, title, content } = req.body;

        if (!PANELS.includes(panel) || !TYPES.includes(type)) {
            return handleResponse(res, 400, 'Invalid panel or type');
        }

        const updated = await LegalPage.findOneAndUpdate(
            { panel, type },
            {
                panel,
                type,
                title: title ?? defaultTitle(type),
                content: content ?? '',
                updatedBy: req.user?.id
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return handleResponse(res, 200, 'Legal page updated successfully', updated);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};
