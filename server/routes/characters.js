//----------------------------------------------------------------------------------------------------------------------
// Routes for character operations
//
// @module characters.js
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');
const logging = require('trivial-logging');

const routeUtils = require('./utils');
const models = require('../models');

// Managers
const systemMan = require('../../systems/manager');

//----------------------------------------------------------------------------------------------------------------------

const logger = logging.loggerFor(module);
const router = express.Router();
const promisify = routeUtils.promisify;
const ensureAuthenticated = routeUtils.ensureAuthenticated;

//----------------------------------------------------------------------------------------------------------------------

router.get('/', (request, response) =>
{
    routeUtils.interceptHTML(response, promisify(() =>
    {
        return models.BaseCharacter.filter(request.query);
    }));
});

router.get('/:charID', (request, response) =>
{
    routeUtils.interceptHTML(response, promisify(() =>
    {
        return models.BaseCharacter.get(request.params.charID)
            .catch(models.errors.DocumentNotFound, (error) =>
            {
                logger.warn('Character not found:\n', error.stack);
                
                response.status(404).json({
                    human: "Character not found.",
                    message: error.message,
                    stack: error.stack
                });
            });
    }));
});

router.post('/', ensureAuthenticated, promisify((request, response) =>
{
    const overrides = {
        owner: request.user.email
    };

    const baseChar = _.merge({}, _.omit(request.body, 'id'), overrides);

    return (new models.BaseCharacter(baseChar)).save()
        .then((char) =>
        {
            // Get the System specific Character Model
            const SysCharacter = systemMan.get(char.system).models.Character;

            // Save a new system character
            return (new SysCharacter({ id: char.id, user: char.user })).save()
                .then(() => char);
        })
        .catch((error) =>
        {
            logger.error('Cannot save character:\n', error.stack);

            response.status(500).json({
                human: "Cannot save character.",
                message: error.message,
                stack: error.stack
            });
        });
}));

router.put('/:charID', ensureAuthenticated, promisify((request, response) =>
{
    const update = _.merge({}, _.omit(request.body, 'id'), { owner: request.user.email });

    return models.BaseCharacter.get(request.params.charID)
        .then((character) =>
        {
            if(character.owner == request.user.email)
            {
                _.merge(character, update);
                character.save();
            }
            else
            {
                response.status(403).json({
                    type: 'NotAuthorized',
                    message: `You are not authorized to update character '${ request.params.charID }'.`
                });
            } // end if
        })
        .catch(models.errors.DocumentNotFound, (error) =>
        {
            logger.warn('Character not found:\n', error.stack);

            response.status(404).json({
                human: "Character not found.",
                message: error.message,
                stack: error.stack
            });
        })
        .catch((error) =>
        {
            logger.error('Cannot save character:\n', error.stack);

            response.status(500).json({
                human: "Cannot save character.",
                message: error.message,
                stack: error.stack
            });
        });
}));

router.delete('/:charID', ensureAuthenticated, promisify((request, response) =>
{
    return models.BaseCharacter.get(request.params.charID)
        .then((character) =>
        {
            if(character.owner == request.user.email)
            {
                return character.delete();
            }
            else
            {
                response.status(403).json({
                    type: 'NotAuthorized',
                    message: `You are not authorized to update character '${ request.params.characterID }'.`
                });
            } // end if
        })
        .then((character) =>
        {
            // Get the System specific Character Model
            return (systemMan.get(character.system).models.Character)
                .get(request.params.charID)
                .then((sysChar) =>
                {
                    return sysChar.delete();
                })
                .catch(models.errors.DocumentNotFound, (error) =>
                {
                    logger.warn(`System specific character not found: '${ request.params.charID }'.`);
                });
        })
        .catch(models.errors.DocumentNotFound, (error) =>
        {
            logger.warn('Character not found:\n', error.stack);

            response.status(404).json({
                human: "Character not found.",
                message: error.message,
                stack: error.stack
            });
        })
        .catch((error) =>
        {
            logger.error('Cannot delete character:\n', error.stack);

            response.status(500).json({
                human: "Cannot delete character.",
                message: error.message,
                stack: error.stack
            });
        });
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------