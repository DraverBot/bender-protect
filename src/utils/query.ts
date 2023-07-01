import { createConnection } from 'mysql';
import { DefaultQueryResult, QueryResult } from '../typings/database';

const bender = createConnection({
    host: process.env.db_h,
    password: process.env.db_p,
    user: process.env.db_u,
    database: process.env.db_bender
});
const draver = createConnection({
    host: process.env.db_h,
    password: process.env.db_p,
    user: process.env.db_u,
    database: process.env.db_draver
});

export const query = <T = DefaultQueryResult>(
    query: string,
    databaseName?: 'draver' | 'bender'
): Promise<QueryResult<T>> => {
    const database = databaseName === 'draver' ? draver : bender;

    return new Promise((resolve, reject) => {
        database.query(query, (error, request) => {
            if (error) return reject(error);
            resolve(request);
        });
    });
};
