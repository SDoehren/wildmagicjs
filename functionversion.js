function message(msg) {
    ChatMessage.create({user: game.user._id, content: msg, speaker: ChatMessage.getSpeaker(),})
}

function creaturesinrange(range) {
    let owntoken = canvas.tokens.controlled[0]
    let sqsize = canvas.scene.dimensions.size
    let sqdist = canvas.scene.dimensions.distance
    let alltokens = canvas.tokens.placeables.filter(x => x.worldVisible)


    let owntokenloc = owntoken.position
    let selfsize = Math.max(...owntoken.hitArea.points)

    let owntokencentre = [owntokenloc.x + selfsize / 2, owntokenloc.y + selfsize / 2]
    let nearby = []

    for (let i = 0; i < alltokens.length; i++) {
        let token = alltokens[i]
        let tokenloc = token.position
        let tokensize = Math.max(...token.hitArea.points)
        let tokensquares = tokensize / sqsize
        let topleftsq = [tokenloc.x + sqsize / 2, tokenloc.y + sqsize / 2]
        let targeted = false
        for (let x = 0; x < tokensquares; x++) {
            for (let y = 0; y < tokensquares; y++) {
                let tokencentre = [topleftsq[0] + x * sqsize, topleftsq[1] + y * sqsize]
                let aa = Math.pow(owntokencentre[0] - tokencentre[0], 2)
                let ab = Math.pow(owntokencentre[1] - tokencentre[1], 2)
                let c = Math.pow(aa + ab, 0.5)
                if ((c / sqsize * sqdist) <= range) {
                    nearby.push(token)
                    targeted = true
                    canvas.ping(token.center, {
                        style: "pulse",
                        duration: 2500
                    });
                    break;
                }
            }
            if (targeted) {
                break;
            }
        }
    }
    return nearby;
}

function creaturesinrangeasstr(range) {
    let nearby = creaturesinrange(range)
    let txt = `Creatures within ${range} feet:<br>`;


    for (let i = 0; i < nearby.length; i++) {
        txt += nearby[i].name + "<br>"
    }
    return [txt, nearby]
}

async function addeffects(effects) {
    console.log(effects)
    let effectlist = []
    let effectname = ""
    for (let i = 0; i < effects.length; i++) {
        effectname = `Wild Surge - ${effects[i][2]}`;

        effect = new ActiveEffect({
            name: effectname,
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

function messageandeffect(msg, time, summary) {
    message(msg)
    addeffects([[msg, time, summary]])
}

async function dicesoniceroll(roll) {
    if (game.modules.get("dice-so-nice")?.active && game.dice3d) {
        await game.dice3d.showForRoll(roll)
    }
}


function checktoken() {
    if (canvas.tokens.controlled[0] === undefined) {
        var content = {
            user: game.user._id,
            content: "No token is not selected, please select your token",
            whisper: game.user._id
        }
        ChatMessage.create(content)
        ui.notifications.warn("No token is not selected, please select your token")
        return false
    } else {
        return true
    }
}

async function checksurge() {
    let surgecheck = await new Roll('1d20').evaluate()
    await dicesoniceroll(surgecheck)

    if (surgecheck._total != 20) {
        txt = "Surge Check:" + "<strong>" + surgecheck._total + "</strong> - No Surge"
        message(txt)
        return false
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
        return true
    }
}


async function surgeroll() {
    let surgeroll = await new Roll('1d100').evaluate()
    await dicesoniceroll(surgeroll)
    return surgeroll._total
}


async function surgeresult(rollvalue) {
    let txt = '<strong>' + rollvalue + '</strong>: '
    let sideroll;
    let effecttxt;
    let creaturesinrangeasstrresult;
    switch (rollvalue) {
        case 1:
        case 2:
        case 3:
        case 4:
            effecttxt = "Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls."
            txt += effecttxt;

            effectsummary = "Roll Surge Every Turn"

            addeffects([[effecttxt, 60, effectsummary]])
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
            await dicesoniceroll(sideroll)

            txt = 'A '
            switch (sideroll._total) {
                case 1:
                    txt += 'Modron Duodrone'
                    break;
                case 2:
                    txt += 'Flumph'
                    break;
                case 3:
                    txt += 'Modron Monodrone'
                    break;
                case 4:
                    txt += 'Unicorn'
                    break;
            }
            message(`<strong>${sideroll._total}</strong>- ${txt} appears`);
            effectsummary = `${txt} Friend`

            txt += ' that is Friendly toward you appears in a random unoccupied space within 60 feet of you. ' +
                'The creature is under the DM’s control and disappears 1 minute later. '


            addeffects([[txt, 60, effectsummary]])
            break;
        case 9:
        case 10:
        case 11:
        case 12:
            txt += 'For the next minute, you regain <strong>5</strong> Hit Points at the start of each of your turns.';
            effectsummary = "5hp per turn"
            message(txt);
            addeffects([[txt, 60, effectsummary]])
            break;
        case 13:
        case 14:
        case 15:
        case 16:
            txt += 'Creatures have <strong>Disadvantage</strong> on saving throws against the next spell you cast in the next minute that involves a saving throw.';
            message(txt);
            effectsummary = "Disadvantage on save against your spells"
            addeffects([[txt, 60, effectsummary]])
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
            await dicesoniceroll(sideroll)
            switch (sideroll._total) {
                case 1:
                    messageandeffect('<strong>1</strong>: For 1 minute, you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; ', 60, 'you’re surrounded by faint, ethereal music');
                    break;
                case 2:
                    messageandeffect('<strong>2</strong>: For 1 minute, your size increases by one size category; ', 60, 'you are bigger');
                    break;
                case 3:
                    messageandeffect('<strong>3</strong>: You grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; ', 99999, "Beard");
                    break;
                case 4:
                    messageandeffect('<strong>4</strong>: For 1 minute, you must shout when you speak.', 60, "You're Shouty");
                    break;
                case 5:
                    messageandeffect('<strong>5</strong>: For 1 minute, illusory butterflies flutter in the air within 10 feet of you.', 60, 'Butterflies');
                    break;
                case 6:
                    messageandeffect('<strong>6</strong>: For 1 minute, an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks.', 60, 'Third Eye - Advantage on Wisdom (Perception) checks');
                    break;
                case 7:
                    messageandeffect('<strong>7</strong>: For 1 minute, pink bubbles float out of your mouth whenever you speak.', 60, "Bubbles");
                    break;
                case 8:
                    messageandeffect('<strong>8</strong>: your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.', 60 * 60 * 24, "You're Blue");
                    break;
            }
            break;

        case 21:
        case 22:
        case 23:
        case 24:
            effecttxt = 'For the next minute, all your spells with a casting time of an action have a casting time of a Bonus Action.';
            effectsummary = "casting time = Bonus Action"

            txt += effecttxt
            message(txt);
            addeffects([[txt, 60, effectsummary]])
            break;
        case 25:
        case 26:
        case 27:
        case 28:
            txt += 'You are transported to the Astral Plane until the end of your next turn. <br>' +
                'You then return to the space you previously occupied or the nearest unoccupied space if that space is occupied.';
            message(txt);
            addeffects([[txt, 7, "Astral Plane!"]])
            break;
        case 29:
        case 30:
        case 31:
        case 32:
            txt += 'The next time you cast a spell that deals damage within the next minute, don’t roll the spell’s damage dice for the damage. <br>' +
                'Instead use the highest number possible for each damage die.';
            messageandeffect(txt, 60, "Once - Max Damage");
            break;
        case 33:
        case 34:
        case 35:
        case 36:
            txt += 'You have Resistance to all damage for the next minute.';
            messageandeffect(txt, 60, 'Resistance to all damage');
            break;
        case 37:
        case 38:
        case 39:
        case 40:
            txt += 'You turn into a potted plant until the start of your next turn. <br>' +
                'While you’re a plant, you have the Incapacitated condition and have Vulnerability to all damage. <br>' +
                'If you drop to 0 Hit Points, your pot breaks, and your form reverts.';
            messageandeffect(txt, 7, 'Potted Plant');
            break;
        case 41:
        case 42:
        case 43:
        case 44:
            txt += 'For the next minute, you can teleport up to 20 feet as a Bonus Action on each of your turns.';
            messageandeffect(txt, 60, 'At Will Teleport');
            break;
        case 45:
        case 46:
        case 47:
        case 48:
            txt += 'You and up to three creatures you choose within 30 feet of you have the Invisible condition for 1 minute. <br>' +
                'This invisibility ends on a creature immediately after it makes an attack roll, deals damage, or casts a spell. '

            txt += '<br><br><br>'

            creaturesinrangeasstrresult = creaturesinrangeasstr(30)
            txt += creaturesinrangeasstrresult[0]

            message(txt);

            break;
        case 49:
        case 50:
        case 51:
        case 52:
            txt += 'A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to Magic Missile.';
            messageandeffect(txt, 60, 'Spectral Shield - +2 AC');
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
            await dicesoniceroll(sideroll)
            switch (sideroll._total) {
                case 1:
                    message('<strong>1</strong>: You cast <strong>Confusion</strong> <br> https://5e.tools/spells.html#confusion_xphb');
                    break;
                case 2:
                    message('<strong>2</strong>: You cast <strong>Fireball</strong> <br> https://5e.tools/spells.html#fireball_xphb');
                    break;
                case 3:
                    message('<strong>3</strong>: You cast <strong>Fog Cloud</strong> <br> https://5e.tools/spells.html#fog%20cloud_xphb');
                    break;
                case 4:
                    message('<strong>4</strong>: You cast <strong>Fly</strong> (cast on a random creature within 60 feet of you) <br> https://5e.tools/spells.html#fly_xphb');

                    creaturesinrangeasstrresult = creaturesinrangeasstr(30)
                    txt = creaturesinrangeasstrresult[0]
                    let nearby = creaturesinrangeasstrresult[1]

                    message(txt)
                    targetingroll = await new Roll('1d' + nearby.length).evaluate()
                    console.log(nearby)
                    await dicesoniceroll(targetingroll)
                    message('<strong>' + sideroll._total + '</strong>: You cast <strong>Fly</strong> on <strong>' + nearby[targetingroll._total - 1].name + '</strong>');
                    //canvas.tokens.placeables[targetingroll._total - 1].setTarget()
                    canvas.ping(nearby[targetingroll._total - 1].center, {
                        style: "alert",
                        duration: 5000
                    });

                    break;
                case 5:
                    message('<strong>5</strong>: You cast <strong>Grease</strong> <br> https://5e.tools/spells.html#grease_xphb');
                    break;
                case 6:
                    message('<strong>6</strong>: You cast <strong>Levitate</strong> (cast on yourself) <br> https://5e.tools/spells.html#levitate_xphb');
                    break;
                case 7:
                    message('<strong>7</strong>: You cast <strong>Magic Missile</strong> (cast as a level 5 spell) <br> https://5e.tools/spells.html#magic%20missile_xphb');
                    break;
                case 8:
                    message('<strong>8</strong>: You cast <strong>Mirror Image</strong> <br> https://5e.tools/spells.html#mirror%20image_xphb');
                    break;
                case 9:
                    message('<strong>9</strong>: You cast <strong>Polymorph</strong> (cast on yourself), and if you fail the saving throw, you turn into a Goat <br> https://5e.tools/spells.html#polymorph_xphb');
                    break;
                case 10:
                    message('<strong>10</strong>: You cast <strong>See Invisibility</strong> <br> https://5e.tools/spells.html#see%20invisibility_xphb');
                    break;
            }
            break;
        case 61:
        case 62:
        case 63:
        case 64:
            txt += 'For the next minute, any flammable, nonmagical object you touch that isn’t being worn or carried by another creature bursts into flame, takes 1d4 Fire damage, and is burning.';
            messageandeffect(txt, 60, 'Fiery Touch');
            break;
        case 65:
        case 66:
        case 67:
        case 68:
            txt += 'If you die within the next hour, you immediately revive as if by the Reincarnate spell.';
            messageandeffect(txt, 60 * 60, 'Auto Reincarnate');
            break;
        case 69:
        case 70:
        case 71:
        case 72:
            txt += 'You have the Frightened condition until the end of your next turn. <br>' +
                'The DM determines the source of your fear.';
            messageandeffect(txt, 12, 'Frightened');
            break;
        case 73:
        case 74:
        case 75:
        case 76:
            txt += 'You teleport up to 60 feet to an unoccupied space you can see.';
            message(txt);

            let owntoken = canvas.tokens.controlled[0];

            let templateData = {
                t: "circle",
                user: game.user.id,
                x: owntoken.center.x,
                y: owntoken.center.y,
                distance: 60,            // radius in scene units (e.g. feet)
                fillColor: "#0000ff",
                fillAlpha: 0.01,
                borderColor: "#ff0000",
                borderAlpha: 1.0
            };

            await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);


            break;
        case 77:
        case 78:
        case 79:
        case 80:
            txt += 'A random creature within 60 feet of you has the Poisoned condition for 1d4 hours.<br>';
            message(txt)

            creaturesinrangeasstrresult = creaturesinrangeasstr(60)
            txt = creaturesinrangeasstrresult[0]
            let nearby = creaturesinrangeasstrresult[1]

            message(txt)
            targetingroll = await new Roll('1d' + nearby.length).evaluate()
            await dicesoniceroll(targetingroll)
            hours = await new Roll('1d4').evaluate()
            await dicesoniceroll(hours)

            message('<strong>' + nearby[targetingroll._total - 1].name + '</strong> has the Poisoned condition for <strong>' + hours._total + '</strong> hours');
            //canvas.tokens.placeables[targetingroll._total - 1].setTarget()
            canvas.ping(nearby[targetingroll._total - 1].center, {
                style: "alert",
                duration: 5000
            });

            break;
        case 81:
        case 82:
        case 83:
        case 84:
            txt += 'You radiate Bright Light in a 30-foot radius for the next minute. <br>' +
                'Any creature that ends its turn within 5 feet of you has the Blinded condition until the end of its next turn.';
            messageandeffect(txt, 60, 'Bright Light');
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
                'You regain Hit Points equal to the sum of the Necrotic damage dealt.'

            txt += '<br><br><br>'

            creaturesinrangeasstrresult = creaturesinrangeasstr(30)
            txt += creaturesinrangeasstrresult[0]


            message(txt);

            Necrotic = await new Roll("1d10").evaluate();
            token = canvas.tokens.controlled[0];

            Necrotic.toMessage({
                speaker: ChatMessage.getSpeaker({token}),
                flavor: "Necrotic Damage"
            });

            break;
        case 89:
        case 90:
        case 91:
        case 92:
            txt += 'Up to three creatures of your choice that you can see within 30 feet of you take 4d10 Lightning damage.'
            txt += '<br><br><br>'
            creaturesinrangeasstrresult = creaturesinrangeasstr(30)

            txt += creaturesinrangeasstrresult[0]
            message(txt);

            Lightning = await new Roll("4d10").evaluate();
            token = canvas.tokens.controlled[0];
            Lightning.toMessage({
                speaker: ChatMessage.getSpeaker({token}),
                flavor: "Lightning Damage"
            });


            break;
        case 93:
        case 94:
        case 95:
        case 96:
            txt += 'You and all creatures within 30 feet of you have Vulnerability to Piercing damage for the next minute.'
            addeffects([[txt, 60, 'Vulnerability to Piercing']]);

            txt += '<br><br>'
            creaturesinrangeasstrresult = creaturesinrangeasstr(30)
            txt += creaturesinrangeasstrresult[0]
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
            await dicesoniceroll(sideroll)
            switch (sideroll._total) {
                case 1:
                    message('<strong>1</strong>: you regain 2d10 Hit Points; ');


                    heal = await new Roll("2d10").evaluate();
                    token = canvas.tokens.controlled[0];
                    heal.toMessage({
                        speaker: ChatMessage.getSpeaker({token}),
                        flavor: "Healing"
                    });

                    break;
                case 2:
                    message('<strong>2</strong>: one ally of your choice within 300 feet of you regains 2d10 Hit Points; ');

                    heal = await new Roll("2d10").evaluate();
                    token = canvas.tokens.controlled[0];
                    heal.toMessage({
                        speaker: ChatMessage.getSpeaker({token}),
                        flavor: "Healing"
                    });

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
                    txt = '<strong>6</strong>: all the effects of row 17–20 affect you simultaneously.<br><br><br>' +
                        'for one minute:<br><br>' +
                        'you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
                        'you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
                        'your size increases by one size category; <br><br>' +
                        'you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; <br><br>' +
                        'you must shout when you speak; <br><br>' +
                        'illusory butterflies flutter in the air within 10 feet of you; <br><br>' +
                        'an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks; <br><br>' +
                        'pink bubbles float out of your mouth whenever you speak; <br><br>' +
                        'your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.'
                    message(txt);
                    addeffects([['For 1 minute, you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; ', 60, 'you’re surrounded by faint, ethereal music'],
                        ['For 1 minute, your size increases by one size category; ', 60, 'you are bigger'],
                        ['You grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; ', 99999, "Beard"],
                        ['For 1 minute, you must shout when you speak.', 60, "You're Shouty"],
                        ['For 1 minute, illusory butterflies flutter in the air within 10 feet of you.', 60, 'Butterflies'],
                        ['For 1 minute, an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks.', 60, 'Third Eye - Advantage on Wisdom (Perception) checks'],
                        ['For 1 minute, pink bubbles float out of your mouth whenever you speak.', 60, "Bubbles"],
                        ['your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.', 60 * 60 * 24, "You're Blue"]])
                    break;
            }
            break;

    }
}

let O1 = `Roll on this table at the start of each of your turns for the next minute, ignoring this result on subsequent rolls.`
let O2 = 'A creature that is Friendly toward you appears in a random unoccupied space within 60 feet of you. ' +
    '<br>The creature is under the DM’s control and disappears 1 minute later. ' +
    '<br>Roll 1d4 to determine the creature: ' +
    '<br><strong>on a 1</strong>, a Modron Duodrone appears; ' +
    '<br><strong>on a 2</strong>, a Flumph appears; ' +
    '<br><strong>on a 3</strong>, a Modron Monodrone appears; ' +
    '<br><strong>on a 4</strong>, a Unicorn appears.' +
    '<br>that is Friendly toward you appears in a random unoccupied space within 60 feet of you. ' +
    'The creature is under the DM’s control and disappears 1 minute later. '
let O3 = 'For the next minute, you regain <strong>5</strong> Hit Points at the start of each of your turns.'
let O4 = 'Creatures have <strong>Disadvantage</strong> on saving throws against the next spell you cast in the next minute that involves a saving throw.'
let O5 = 'You are subjected to an effect that lasts for 1 minute unless its description says otherwise. <br>' +
    'Roll 1d8 to determine the effect: <br>' +
    '<strong>on a 1</strong>, you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br>' +
    '<strong>on a 2</strong>, your size increases by one size category; <br>' +
    '<strong>on a 3</strong>, you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; <br>' +
    '<strong>on a 4</strong>, you must shout when you speak; <br>' +
    '<strong>on a 5</strong>, illusory butterflies flutter in the air within 10 feet of you; <br>' +
    '<strong>on a 6</strong>, an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks; <br>' +
    '<strong>on an 7</strong>, pink bubbles float out of your mouth whenever you speak; <br>' +
    '<strong>on an 8</strong>, your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.'
let O6 = 'For the next minute, all your spells with a casting time of an action have a casting time of a Bonus Action.'
let O7 = 'You are transported to the Astral Plane until the end of your next turn. <br>' +
    'You then return to the space you previously occupied or the nearest unoccupied space if that space is occupied.'
let O8 = 'The next time you cast a spell that deals damage within the next minute, don’t roll the spell’s damage dice for the damage. <br>' +
    'Instead use the highest number possible for each damage die.'
let O9 = 'You have Resistance to all damage for the next minute.'
let O10 = 'You turn into a potted plant until the start of your next turn. <br>' +
    'While you’re a plant, you have the Incapacitated condition and have Vulnerability to all damage. <br>' +
    'If you drop to 0 Hit Points, your pot breaks, and your form reverts.'
let O11 = 'For the next minute, you can teleport up to 20 feet as a Bonus Action on each of your turns.'
let O12 = 'You and up to three creatures you choose within 30 feet of you have the Invisible condition for 1 minute. <br>' +
    'This invisibility ends on a creature immediately after it makes an attack roll, deals damage, or casts a spell.'
let O13 = 'A spectral shield hovers near you for the next minute, granting you a +2 bonus to AC and immunity to Magic Missile.'
let O14 = 'You can take one extra action on this turn.'
let O15 = 'You cast a random spell. <br>' +
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
    '<strong>on a 10</strong>, See Invisibility.'
let O16 = 'For the next minute, any flammable, nonmagical object you touch that isn’t being worn or carried by another creature bursts into flame, takes 1d4 Fire damage, and is burning.';
let O17 = 'If you die within the next hour, you immediately revive as if by the Reincarnate spell.'
let O18 = 'You have the Frightened condition until the end of your next turn. <br>' +
    'The DM determines the source of your fear.'
let O19 = 'You teleport up to 60 feet to an unoccupied space you can see.'
let O20 = `A random creature within 60 feet of you has the Poisoned condition for 1d4 hours.`
let O21 = 'You radiate Bright Light in a 30-foot radius for the next minute. <br>' +
    'Any creature that ends its turn within 5 feet of you has the Blinded condition until the end of its next turn.'
let O22 = 'Up to three creatures of your choice that you can see within 30 feet of you take 1d10 Necrotic damage. <br>' +
    'You regain Hit Points equal to the sum of the Necrotic damage dealt'
let O23 = `Up to three creatures of your choice that you can see within 30 feet of you take 4d10 Lightning damage.`
let O24 = `You and all creatures within 30 feet of you have Vulnerability to Piercing damage for the next minute.`
let O25 = 'Roll 1d6: <br>' +
    '<strong>On a 1</strong>, you regain 2d10 Hit Points; <br>' +
    '<strong>on a 2</strong>, one ally of your choice within 300 feet of you regains 2d10 Hit Points; <br>' +
    '<strong>on a 3</strong>, you regain your lowest-level expended spell slot; <br>' +
    '<strong>on a 4</strong>, one ally of your choice within 300 feet of you regains their lowest-level expended spell slot; <br>' +
    '<strong>on a 5</strong>, you regain all your expended Sorcery Points; <br>' +
    '<strong>on a 6</strong>, all the effects of row 17–20 affect you simultaneously.<br><br>' +
    'row 17–20:<br>' +
    'for one minute:<br><br>' +
    'messageandeffect’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
    'you’re surrounded by faint, ethereal music only you and creatures within 5 feet of you can hear; <br><br>' +
    'your size increases by one size category; <br><br>' +
    'you grow a long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face and vanish; <br><br>' +
    'you must shout when you speak; <br><br>' +
    'illusory butterflies flutter in the air within 10 feet of you; <br><br>' +
    'an eye appears on your forehead, granting you Advantage on Wisdom (Perception) checks; <br><br>' +
    'pink bubbles float out of your mouth whenever you speak; <br><br>' +
    'your skin turns a vibrant shade of blue for 24 hours or until the effect is ended by a Remove Curse spell.'

const surgedesc = {
    1: O1,
    2: O1,
    3: O1,
    4: O1,
    5: O2,
    6: O2,
    7: O2,
    8: O2,
    9: O3,
    10: O3,
    11: O3,
    12: O3,
    13: O4,
    14: O4,
    15: O4,
    16: O4,
    17: O5,
    18: O5,
    19: O5,
    20: O5,
    21: O6,
    22: O6,
    23: O6,
    24: O6,
    25: O7,
    26: O7,
    27: O7,
    28: O7,
    29: O8,
    30: O8,
    31: O8,
    32: O8,
    33: O9,
    34: O9,
    35: O9,
    36: O9,
    37: O10,
    38: O10,
    39: O10,
    40: O10,
    41: O11,
    42: O11,
    43: O11,
    44: O11,
    45: O12,
    46: O12,
    47: O12,
    48: O12,
    49: O13,
    50: O13,
    51: O13,
    52: O13,
    53: O14,
    54: O14,
    55: O14,
    56: O14,
    57: O15,
    58: O15,
    59: O15,
    60: O15,
    61: O16,
    62: O16,
    63: O16,
    64: O16,
    65: O17,
    66: O17,
    67: O17,
    68: O17,
    69: O18,
    70: O18,
    71: O18,
    72: O18,
    73: O19,
    74: O19,
    75: O19,
    76: O19,
    77: O20,
    78: O20,
    79: O20,
    80: O20,
    81: O21,
    82: O21,
    83: O21,
    84: O21,
    85: O22,
    86: O22,
    87: O22,
    88: O22,
    89: O23,
    90: O23,
    91: O23,
    92: O23,
    93: O24,
    94: O24,
    95: O24,
    96: O24,
    97: O25,
    98: O25,
    99: O25,
    100: O25,
}

async function advantagedialog(surgerolls) {
    let diacontent =
        "<h1 style='color:#FF0000;display:inline'>W</h1>" +
        "<h1 style='color:#FF7F00;display:inline'>i</h1>" +
        "<h1 style='color:#FFFF00;display:inline'>l</h1>" +
        "<h1 style='color:#00ff00;display:inline'>d </h1>" +
        "<h1 style='color:#00ff7f;display:inline'>S</h1>" +
        "<h1 style='color:#00e1ff;display:inline'>u</h1>" +
        "<h1 style='color:#0000ff;display:inline'>r</h1>" +
        "<h1 style='color:#7f00ff;display:inline'>g</h1>" +
        "<h1 style='color:#ff00ff;display:inline'>e</h1>" +
        `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 5px;">
      <div>
        <h3>${surgerolls[0]}</h3>
        <p>${surgedesc[surgerolls[0]]}</p>
      </div>

      <div>
        <h3>${surgerolls[1]}</h3>
        <p>${surgedesc[surgerolls[1]]}</p>
      </div>
    </div>
  `
    ChatMessage.create({user: game.user._id, content: diacontent, speaker: ChatMessage.getSpeaker(),})
    const selection = await new Promise(resolve => {
        new Dialog({
            title: "Pick a Surge",
            content: `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 5px;">
      <div>
        <h3>${surgerolls[0]}</h3>
        <p>${surgedesc[surgerolls[0]]}</p>
      </div>

      <div>
        <h3>${surgerolls[1]}</h3>
        <p>${surgedesc[surgerolls[1]]}</p>
      </div>
    </div>
  `,
            buttons: {
                a: {label: surgerolls[0], callback: () => resolve(surgerolls[0])},
                b: {label: surgerolls[1], callback: () => resolve(surgerolls[1])},
            },
            close: () => resolve(null)
        }).render(true);
    });
    console.log(selection);

    const selectiontxt = `<div>
        <h3>Wild Choice: ${selection}</h3>
        <p>${surgedesc[selection]}</p>
      </div>`

    ChatMessage.create({user: game.user._id, content: selectiontxt, speaker: ChatMessage.getSpeaker(),})

    return selection;
}

/*let check = checktoken()

if (check) {
    check = await checksurge()
}
check=true
if (check) {
    let surgerollresult = await surgeroll()
    ui.notifications.warn(surgerollresult)
    await surgeresult(90)
}

let surgerolls = await new Roll('2d100').evaluate()
dicesoniceroll(surgerolls)
surgerolls = surgerolls.terms[0].results.map(x => x.result)
let surgechoice = await advantagedialog(surgerolls)

await surgeresult(surgechoice)*/