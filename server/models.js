//----------------------------------------------------------------------------------------------------------------------
/// Models
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

import trivialModels from 'trivialmodels';

var types = trivialModels.types;
var db = { errors: trivialModels.errors };

//----------------------------------------------------------------------------------------------------------------------

db.User = trivialModels.define({
    name: 'User',
    driver: {
        name: 'TrivialDB',
        options: {
            namespace: {
                name: 'base',
                dbPath: 'server/db',
            },
            pk: 'email'
        }
    },
    schema: {
        email: types.String({ pk: true }),
        name: types.String(),
        admin: types.Boolean({default: false}),
        created: types.Date({ auto: true }),
        permissions: types.Object()
    }
});

db.BaseCharacter = trivialModels.define({
    name: 'Character',
    driver: {
        name: 'TrivialDB',
        options: {
            name: 'characters',
            namespace: {
                name: 'base',
                dbPath: 'server/db',
            },
            pk: 'id'
        },
    schema: {
        id: types.String({ pk: true }),
        name: types.String({ required: true }),
        system: types.String({ required: true }),
        description: types.String(),
        portrait: types.String(),
        thumbnail: types.String(),
        biography: types.String(),
        user: types.String({ required: true })
    }
});

//----------------------------------------------------------------------------------------------------------------------

export default db;

//----------------------------------------------------------------------------------------------------------------------