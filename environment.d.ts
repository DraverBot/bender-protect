declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            db_h: string;
            db_p: string;
            db_u: string;
            db_draver: string;
            db_bender: string;
            draverId: string;
        }
    }
}

export {}