function message(msg) {
    ChatMessage.create({user: game.user._id, content: msg, speaker: ChatMessage.getSpeaker(),})
}

async function addeffects(effects) {
    console.log(effects)
    effectlist = []
    for (let i = 0; i < effects.length; i++) {
        effect = new ActiveEffect({
            name: "Wild Surge",
            img: 'icons/svg/ice-aura.svg',
            disabled: false,
            duration: {"seconds": parseInt(effects[i][1])},
            description: effects[i][0],
            origin: "Wild Surge"
        })
        effectlist.push(effect);
    }
    await canvas.tokens.controlled[0].actor.createEmbeddedDocuments("ActiveEffect", effectlist)
}

function messageandeffect(msg, time) {
    message(msg)
    addeffects([[msg, time]])
}

if (canvas.tokens.controlled[0] === undefined) {
    var content = {
        user: game.user._id,
        content: "No token is not selected, please select your token",
        whisper: game.user._id
    }
    ChatMessage.create(content)
    ui.notifications.warn("No token is not selected, please select your token")

} else {
    let surgecheck = await new Roll('1d20').evaluate()
    /*while (surgeroll._total != 100) {
        surgeroll = await new Roll('1d100').evaluate()
    }*/

    await game.dice3d.showForRoll(surgecheck)

    let txt = ""
    if (surgecheck._total != 20) {
        txt = "Surge Check:"+"<strong>" + surgecheck._total + "</strong> - No Surge"
        message(txt)

    } else {

        txt = "<strong>" +
            "<p style='color:#FF0000;display:inline'>W</p>" +
            "<p style='color:#FF7F00;display:inline'>i</p>" +
            "<p style='color:#FFFF00;display:inline'>l</p>" +
            "<p style='color:#00ff00;display:inline'>d </p>" +
            "<p style='color:#00ff7f;display:inline'>S</p>" +
            "<p style='color:#00e1ff;display:inline'>u</p>" +
            "<p style='color:#0000ff;display:inline'>r</p>" +
            "<p style='color:#7f00ff;display:inline'>g</p>" +
            "<p style='color:#ff00ff;display:inline'>e</p>" +
            "</strong>"
        message(txt)
        let surgeroll = await new Roll('1d100').evaluate()
        /*while (surgeroll._total != 100) {
            surgeroll = await new Roll('1d100').evaluate()
        }*/

        await game.dice3d.showForRoll(surgeroll)

        txt = '<strong>' + surgeroll._total + '</strong>: '
        let sideroll;
        switch (surgeroll._total) {
            case 1:
            case 2:
            case 3:
            case 4:
                txt += 'Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls.';
                addeffects([["Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls.", 60]])
                message(txt);
                break;
            case 5:
            case 6:
            case 7:
            case 8:
                txt += 'A creature that is Friendly toward you appears in a random unoccupied space within 60 feet of you. ' +
                    '<br>The creature is under the DM’s control and disappears 1 minute later. ' +
                    '<br>Roll 1d4 to determine the creature: ' +
                    '<br><strong>on a 1</strong>, a Modron Duodrone appears; ' +
                    '<br><strong>on a 2</strong>, a Flumph appears; ' +
                    '<br><strong>on a 3</strong>, a Modron Monodrone appears; ' +
                    '<br><strong>on a 4</strong>, a Unicorn appears.';
                message(txt);

                sideroll = await new Roll('1d4').evaluate()
                await game.dice3d.showForRoll(sideroll)

                txt = 'A '
                switch (sideroll._total) {
                    case 1:
                        message('<strong>1</strong>: a Modron Duodrone appears; ');
                        txt += 'Modron Duodrone'
                        break;
                    case 2:
                        message('<strong>2</strong>: a Flumph appears; ');
                        txt += 'Flumph'
                        break;
                    case 3:
                        message('<strong>3</strong>: a Modron Monodrone appears; ');
                        txt += 'Modron Monodrone'
                        break;
                    case 4:
                        message('<strong>4</strong>: a Unicorn appears.');
                        txt += 'Unicorn'
                        break;
                }
                txt += ' that is Friendly toward you appears in a random unoccupied space within 60 feet of you. ' +
                    'The creature is under the DM’s control and disappears 1 minute later. '
                addeffects([[txt, 60]])
                break;
            case 9:
            case 10:
            case 11:
            case 12:
                txt += 'For the next minute, you regain <strong>5</strong> Hit Points at the start of each of your turns.';
                message(txt);
                addeffects([[txt, 60]])
                break;
            case 13:
            case 14:
            case 15:
            case 16:
                txt += 'Creatures have <strong>Disadvantage</strong> on saving throws against the next spell you cast in the next minute that involves a saving throw.';
                message(txt);
                addeffects([[txt, 60]])
                break;
            case 17:
            case 18:
            case 19:
            case 20:
                txt += 'You are subjected to an effect that lasts for 1 minute unless its description says otherwise. <br>' +
                    'Roll 1d8 to determine the effect: <br>' +
                    '<strong>on a 1</strong>, you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br>' +
                    '<strong>on a 2</strong>, your size increases by one size category; <br>' +
                    '<strong>on a 3</strong>, you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; <br>' +
                    '<strong>on a 4</strong>, you must shout when you speak; <br>' +
                    '<strong>on a 5</strong>, illusory butterflies flutter in the air within 10 feet of you; <br>' +
                    '<strong>on a 6</strong>, an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks; <br>' +
                    '<strong>on an 7</strong>, pink bubbles float out of your mouth whenever you speak; <br>' +
                    '<strong>on an 8</strong>, your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.';
                message(txt);

                sideroll = await new Roll('1d8').evaluate()
                await game.dice3d.showForRoll(sideroll)
                switch (sideroll._total) {
                    case 1:
                        messageandeffect('<strong>1</strong>: For 1 minute, you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; ', 60);
                        break;
                    case 2:
                        messageandeffect('<strong>2</strong>: For 1 minute, your size increases by one size category; ', 60);
                        break;
                    case 3:
                        message('<strong>3</strong>: You grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; ');
                        break;
                    case 4:
                        messageandeffect('<strong>4</strong>: For 1 minute, you must shout when you speak.', 60);
                        break;
                    case 5:
                        messageandeffect('<strong>5</strong>: For 1 minute, illusory butterflies flutter in the air within 10 feet of you.', 60);
                        break;
                    case 6:
                        messageandeffect('<strong>6</strong>: For 1 minute, an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks.', 60);
                        break;
                    case 7:
                        messageandeffect('<strong>7</strong>: For 1 minute, pink bubbles float out of your mouth whenever you speak.', 60);
                        break;
                    case 8:
                        messageandeffect('<strong>8</strong>: your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.', 60 * 60 * 24);
                        break;
                }
                break;

            case 21:
            case 22:
            case 23:
            case 24:
                txt += 'For the next minute, all your spells with a casting time of an action have a casting time of a Bonus Action.';
                message(txt);
                break;
            case 25:
            case 26:
            case 27:
            case 28:
                txt += 'You are transported to the Astral Plane until the end of your next turn. <br>' +
                    'You then return to the space you previously occupied or the nearest unoccupied space if that space is occupied.';
                message(txt);
                break;
            case 29:
            case 30:
            case 31:
            case 32:
                txt += 'The next time you cast a spell that deals damage within the next minute, don’t roll the spell’s damage dice for the damage. <br>' +
                    'Instead use the highest number possible for each damage die.';
                messageandeffect(txt, 60);
                break;
            case 33:
            case 34:
            case 35:
            case 36:
                txt += 'You have Resistance to all damage for the next minute.';
                messageandeffect(txt, 60);
                break;
            case 37:
            case 38:
            case 39:
            case 40:
                txt += 'You turn into a potted plant until the start of your next turn. <br>' +
                    'While you’re a plant, you have the Incapacitated condition and have Vulnerability to all damage. <br>' +
                    'If you drop to 0 Hit Points, your pot breaks, and your form reverts.';
                messageandeffect(txt, 7);
                break;
            case 41:
            case 42:
            case 43:
            case 44:
                txt += 'For the next minute, you can teleport up to 20 feet as a Bonus Action on each of your turns.';
                messageandeffect(txt, 60);
                break;
            case 45:
            case 46:
            case 47:
            case 48:
                txt += 'You and up to three creatures you choose within 30 feet of you have the Invisible condition for 1 minute. <br>' +
                    'This invisibility ends on a creature immediately after it makes an attack roll, deals damage, or casts a spell.'

                addeffects([txt, 60])

                txt += '<br><br><br>Creatures within 30 feet:<br>';


                owntoken = canvas.tokens.controlled[0]
                sqsize = canvas.scene.dimensions.size
                sqdist = canvas.scene.dimensions.distance
                alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                owntokenloc = owntoken.position
                owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                nearby = []
                for (let i = 0; i < alltokens.length; i++) {
                    token = alltokens[i]
                    tokenloc = token.position
                    tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                    aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                    ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                    c = Math.pow(aa + ab, 0.5)
                    if ((c / sqsize * sqdist) <= 30) {
                        nearby.push(token)
                    }
                }

                for (let i = 0; i < nearby.length; i++) {
                    txt += nearby[i].name + "<br>"
                }
                message(txt);

                break;
            case 49:
            case 50:
            case 51:
            case 52:
                txt += 'A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to Magic Missile.';
                messageandeffect(txt, 60);
                break;
            case 53:
            case 54:
            case 55:
            case 56:
                txt += 'You can take one extra action on this turn.';
                message(txt);
                break;
            case 57:
            case 58:
            case 59:
            case 60:
                txt += 'You cast a random spell. <br>' +
                    'If the spell normally requires Concentration, it doesn’t require Concentration in this case; the spell lasts for its full duration. <br>' +
                    'Roll 1d10 to determine the spell: <br>' +
                    '<strong>on a 1</strong>, Confusion; <br>' +
                    '<strong>on a 2</strong>, Fireball; <br>' +
                    '<strong>on a 3</strong>, Fog Cloud; <br>' +
                    '<strong>on a 4</strong>, Fly (cast on a random creature within 60 feet of you), <br>' +
                    '<strong>on a 5</strong>, Grease; <br>' +
                    '<strong>on a 6</strong>, Levitate (cast on yourself); <br>' +
                    '<strong>on a 7</strong>, Magic Missile (cast as a level 5 spell); <br>' +
                    '<strong>on an 8</strong>, Mirror Image; <br>' +
                    '<strong>on a 9</strong>, Polymorph (cast on yourself), and if you fail the saving throw, you turn into a Goat; <br>' +
                    '<strong>on a 10</strong>, See Invisibility.';
                message(txt);

                sideroll = await new Roll('1d10').evaluate()
                await game.dice3d.showForRoll(sideroll)
                switch (4) {
                    case 1:
                        message('<strong>1</strong>: You cast <strong>Confusion</strong> ');
                        break;
                    case 2:
                        message('<strong>2</strong>: You cast <strong>Fireball</strong>');
                        break;
                    case 3:
                        message('<strong>3</strong>: You cast <strong>Fog Cloud</strong>');
                        break;
                    case 4:
                        message('<strong>4</strong>: You cast <strong>Fly</strong> (cast on a random creature within 60 feet of you)');
                        owntoken = canvas.tokens.controlled[0]
                        sqsize = canvas.scene.dimensions.size
                        sqdist = canvas.scene.dimensions.distance
                        alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                        owntokenloc = owntoken.position
                        owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                        nearby = []
                        for (let i = 0; i < alltokens.length; i++) {
                            token = alltokens[i]
                            tokenloc = token.position
                            tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                            aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                            ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                            c = Math.pow(aa + ab, 0.5)
                            if ((c / sqsize * sqdist) < 60) {
                                nearby.push(token)
                            }
                        }
                        txt = ""
                        for (let i = 0; i < nearby.length; i++) {
                            txt += "<strong>" + (i + 1) + "</strong>: " + nearby[i].name + "<br>"
                        }
                        message(txt)
                        sideroll = await new Roll('1d' + nearby.length).evaluate()
                        await game.dice3d.showForRoll(sideroll)
                        message('<strong>' + sideroll._total + '</strong>: You cast <strong>Fly</strong> on <strong>' + nearby[sideroll._total - 1].name + '</strong>');
                        canvas.tokens.placeables[sideroll._total - 1].setTarget()
                        break;
                    case 5:
                        message('<strong>5</strong>: You cast <strong>Grease</strong>');
                        break;
                    case 6:
                        message('<strong>6</strong>: You cast <strong>Levitate</strong> (cast on yourself)  https://5e.tools/spells.html#levitate_xphb');
                        break;
                    case 7:
                        message('<strong>7</strong>: You cast <strong>Magic Missile</strong> (cast as a level 5 spell)');
                        break;
                    case 8:
                        message('<strong>8</strong>: You cast <strong>Mirror Image</strong>');
                        break;
                    case 9:
                        message('<strong>9</strong>: You cast <strong>Polymorph</strong> (cast on yourself), and if you fail the saving throw, you turn into a Goat');
                        break;
                    case 10:
                        message('<strong>10</strong>: You cast <strong>See Invisibility</strong>');
                        break;
                }
                break;
            case 61:
            case 62:
            case 63:
            case 64:
                txt += 'For the next minute, any flammable, nonmagical object you touch that isn’t being worn or carried by another creature bursts into flame, takes 1d4 Fire damage, and is burning.';
                messageandeffect(txt, 60);
                break;
            case 65:
            case 66:
            case 67:
            case 68:
                txt += 'If you die within the next hour, you immediately revive as if by the Reincarnate spell.';
                messageandeffect(txt, 60 * 60);
                break;
            case 69:
            case 70:
            case 71:
            case 72:
                txt += 'You have the Frightened condition until the end of your next turn. <br>' +
                    'The DM determines the source of your fear.';
                messageandeffect(txt, 12);
                break;
            case 73:
            case 74:
            case 75:
            case 76:
                txt += 'You teleport up to 60 feet to an unoccupied space you can see.';
                message(txt);
                break;
            case 77:
            case 78:
            case 79:
            case 80:
                txt += 'A random creature within 60 feet of you has the Poisoned condition for 1d4 hours.<br>';

                owntoken = canvas.tokens.controlled[0]
                sqsize = canvas.scene.dimensions.size
                sqdist = canvas.scene.dimensions.distance
                alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                owntokenloc = owntoken.position
                owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                nearby = []
                for (let i = 0; i < alltokens.length; i++) {
                    token = alltokens[i]
                    tokenloc = token.position
                    tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                    aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                    ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                    c = Math.pow(aa + ab, 0.5)
                    if ((c / sqsize * sqdist) < 60) {
                        nearby.push(token)
                    }
                }

                for (let i = 0; i < nearby.length; i++) {
                    txt += "<strong>" + (i + 1) + "</strong>: " + nearby[i].name + "<br>"
                }
                message(txt)
                sideroll = await new Roll('1d' + nearby.length).evaluate()
                game.dice3d.showForRoll(sideroll)
                hours = await new Roll('1d4').evaluate()
                await game.dice3d.showForRoll(hours)
                messageandeffect('<strong>' + nearby[sideroll._total - 1].name + '</strong> has the Poisoned condition for <strong>' + hours._total + '</strong> hours', 60 * 60 * hours._total);
                canvas.tokens.placeables[sideroll._total - 1].setTarget()

                break;
            case 81:
            case 82:
            case 83:
            case 84:
                txt += 'You radiate Bright Light in a 30-foot radius for the next minute. <br>' +
                    'Any creature that ends its turn within 5 feet of you has the Blinded condition until the end of its next turn.';
                messageandeffect(txt, 60);
                var token = canvas.tokens.controlled[0]
                token.document.update({
                    light: {
                        dim: 30,
                        bright: 0,
                        color: "#fff45c",
                        alpha: 0.6,
                        angle: 360,
                        animation: {type: "torch", speed: 1, intensity: 3}
                    }
                });

                break;
            case 85:
            case 86:
            case 87:
            case 88:
                txt += 'Up to three creatures of your choice that you can see within 30 feet of you take 1d10 Necrotic damage. <br>' +
                    'You regain Hit Points equal to the sum of the Necrotic damage dealt.<br><br><br>' +
                    'Creatures within 30 feet:<br>';


                owntoken = canvas.tokens.controlled[0]
                sqsize = canvas.scene.dimensions.size
                sqdist = canvas.scene.dimensions.distance
                alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                owntokenloc = owntoken.position
                owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                nearby = []
                for (let i = 0; i < alltokens.length; i++) {
                    token = alltokens[i]
                    tokenloc = token.position
                    tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                    aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                    ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                    c = Math.pow(aa + ab, 0.5)
                    if ((c / sqsize * sqdist) <= 30) {
                        nearby.push(token)
                    }
                }

                for (let i = 0; i < nearby.length; i++) {
                    txt += nearby[i].name + "<br>"
                }

                message(txt);
                break;
            case 89:
            case 90:
            case 91:
            case 92:
                txt += 'Up to three creatures of your choice that you can see within 30 feet of you take 4d10 Lightning damage.<br><br><br>' +
                    'Creatures within 30 feet:<br>';


                owntoken = canvas.tokens.controlled[0]
                sqsize = canvas.scene.dimensions.size
                sqdist = canvas.scene.dimensions.distance
                alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                owntokenloc = owntoken.position
                owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                nearby = []
                for (let i = 0; i < alltokens.length; i++) {
                    token = alltokens[i]
                    tokenloc = token.position
                    tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                    aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                    ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                    c = Math.pow(aa + ab, 0.5)
                    if ((c / sqsize * sqdist) <= 30) {
                        nearby.push(token)
                    }
                }

                for (let i = 0; i < nearby.length; i++) {
                    txt += nearby[i].name + "<br>"
                }

                message(txt);
                break;
            case 93:
            case 94:
            case 95:
            case 96:
                txt += 'You and all creatures within 30 feet of you have Vulnerability to Piercing damage for the next minute.'
                addeffects([[txt, 60]]);
                txt += '<br><br>Creatures within 30 feet:<br>';


                owntoken = canvas.tokens.controlled[0]
                sqsize = canvas.scene.dimensions.size
                sqdist = canvas.scene.dimensions.distance
                alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)
                owntokenloc = owntoken.position
                owntokencentre = [owntokenloc.x + owntoken.hitArea.height / 2, owntokenloc.y + owntoken.hitArea.width / 2]
                nearby = []
                for (let i = 0; i < alltokens.length; i++) {
                    token = alltokens[i]
                    tokenloc = token.position
                    tokencentre = [tokenloc.x + token.hitArea.height / 2, tokenloc.y + token.hitArea.width / 2]
                    aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                    ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                    c = Math.pow(aa + ab, 0.5)
                    if ((c / sqsize * sqdist) <= 30) {
                        nearby.push(token)
                    }
                }

                for (let i = 0; i < nearby.length; i++) {
                    txt += nearby[i].name + "<br>"
                }

                message(txt);
                break;
            case 97:
            case 98:
            case 99:
            case 100:
                txt += 'Roll 1d6: <br>' +
                    '<strong>On a 1</strong>, you regain 2d10 Hit Points; <br>' +
                    '<strong>on a 2</strong>, one ally of your choice within 300 feet of you regains 2d10 Hit Points; <br>' +
                    '<strong>on a 3</strong>, you regain your lowest-level expended spell slot; <br>' +
                    '<strong>on a 4</strong>, one ally of your choice within 300 feet of you regains their lowest-level expended spell slot; <br>' +
                    '<strong>on a 5</strong>, you regain all your expended Sorcery Points; <br>' +
                    '<strong>on a 6</strong>, all the effects of row 17–20 affect you simultaneously.';
                message(txt);

                sideroll = await new Roll('1d6').evaluate()
                await game.dice3d.showForRoll(sideroll)
                switch (sideroll._total) {
                    case 1:
                        message('<strong>1</strong>: you regain 2d10 Hit Points; ');

                        heal = await new Roll('2d10').evaluate()
                        await game.dice3d.showForRoll(heal)
                        message('you regain <strong>' + heal._total + '</strong> Hit Points');

                        break;
                    case 2:
                        message('<strong>2</strong>: one ally of your choice within 300 feet of you regains 2d10 Hit Points; ');

                        heal = await new Roll('2d10').evaluate()
                        await game.dice3d.showForRoll(heal)
                        message('one ally of your choice within 300 feet of you regain <strong>' + heal._total + '</strong> Hit Points');

                        break;
                    case 3:
                        message('<strong>3</strong>: you regain your lowest-level expended spell slot ');
                        break;
                    case 4:
                        message('<strong>4</strong>: one ally of your choice within 300 feet of you regains their lowest-level expended spell slot');
                        break;
                    case 5:
                        message('<strong>5</strong>: you regain all your expended Sorcery Points.');
                        break;
                    case 6:
                        message('<strong>6</strong>: all the effects of row 17–20 affect you simultaneously.<br><br><br>' +
                            'for one minute:<br><br>' +
                            'messageandeffect’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
                            'you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
                            'your size increases by one size category; <br><br>' +
                            'you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; <br><br>' +
                            'you must shout when you speak; <br><br>' +
                            'illusory butterflies flutter in the air within 10 feet of you; <br><br>' +
                            'an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks; <br><br>' +
                            'pink bubbles float out of your mouth whenever you speak; <br><br>' +
                            'your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.', 60);
                        break;
                }
                break;

        }
    }
}