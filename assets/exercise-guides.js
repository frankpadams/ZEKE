/* ZEKE v0.28.1 reviewed exercise-guide library.
   Guidance is educational, not diagnosis, medical clearance, or physical therapy.
   Photographs are loaded from Wikimedia Commons and carry per-image attribution below. */
(() => {
  'use strict';

  const commonsPhoto = (filename) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1280`;
  const commonsPage = (filename) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename).replace(/%20/g, '_')}`;
  const license = (name, url) => ({ name, url });

  const guides = {
    'chest press': {
      name: 'Chest Press', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Pectoralis major', 'Anterior deltoids', 'Triceps'], equipment: 'Seated chest-press machine',
      photo: {src: commonsPhoto('Girl doing chest press machine exercise.jpg'), alt: 'Adult performing a seated chest press on a resistance machine', credit: 'Tyler Read / PTPioneer', source: commonsPage('Girl doing chest press machine exercise.jpg'), license: license('CC BY 2.0','https://creativecommons.org/licenses/by/2.0/')},
      setup: [
        'Adjust the seat so the handles begin around mid-chest height rather than near the neck or abdomen.',
        'Place both feet flat. Keep the head, upper back, and hips supported by the pads.',
        'Choose a grip that lets the wrists stay straight and the elbows track slightly below shoulder height.',
        'Begin with the shoulder blades gently set against the pad; do not force them into an exaggerated arch.'
      ],
      movement: [
        'Press the handles forward smoothly while keeping the wrists stacked over the forearms.',
        'Stop just before the elbows lock hard; keep tension through the chest and arms.',
        'Return under control until the upper arms are roughly in line with the torso or the machine’s safe stop.',
        'Exhale during the press and inhale during the controlled return.'
      ],
      mistakes: [
        'Seat too low or too high, causing the elbows to flare near the ears or the handles to press toward the stomach.',
        'Letting the shoulders roll forward at the end of the press.',
        'Bouncing the weight stack, shortening the return, or using momentum from the torso.',
        'Continuing through sharp, catching, or increasing shoulder pain.'
      ],
      tips: [
        'Use a neutral or converging grip when available if it feels more comfortable at the shoulder.',
        'Reduce range before increasing load when the final portion of the return causes discomfort.',
        'Keep the same seat setting in ZEKE notes so future sessions are comparable.',
        'For a healing shoulder, follow the range and loading limits given by the treating clinician.'
      ]
    },

    'lat pulldown': {
      name: 'Lat Pulldown', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Latissimus dorsi', 'Biceps', 'Mid-back'], equipment: 'Cable lat-pulldown machine',
      photo: {src: commonsPhoto('Girl doing lat pulldown exercise.jpg'), alt: 'Adult seated at a lat-pulldown station holding a wide bar', credit: 'Tyler Read / PTPioneer', source: commonsPage('Girl doing lat pulldown exercise.jpg'), license: license('CC BY 2.0','https://creativecommons.org/licenses/by/2.0/')},
      setup: [
        'Set the thigh pad snugly enough to keep the hips down without pinching.',
        'Take a comfortable overhand or neutral grip; very wide grips usually shorten useful range.',
        'Sit tall with the ribs stacked over the pelvis and a small natural lean, not a deep recline.',
        'Start with the arms long and shoulders controlled rather than shrugged forcefully toward the ears.'
      ],
      movement: [
        'Initiate by drawing the elbows down toward the sides of the rib cage.',
        'Pull the bar toward the upper chest or collarbone area without moving it behind the neck.',
        'Pause briefly while keeping the chest tall and neck relaxed.',
        'Return the bar slowly until the elbows straighten and the shoulder blades move upward naturally.'
      ],
      mistakes: [
        'Pulling behind the neck or yanking the bar toward the stomach with a large backward swing.',
        'Using a grip so wide that the elbows cannot travel down comfortably.',
        'Shrugging at the bottom instead of keeping the neck long.',
        'Letting the weight stack slam between repetitions.'
      ],
      tips: [
        'Think “elbows to pockets” rather than “hands to chest.”',
        'A neutral-grip attachment can be easier on some shoulders and wrists.',
        'If grip fails before the back muscles, lower the load before changing technique.',
        'Stop for sharp shoulder pain, numbness, or symptoms traveling down the arm.'
      ]
    },

    'seated row': {
      name: 'Seated Row', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Rhomboids', 'Middle trapezius', 'Latissimus dorsi', 'Biceps'], equipment: 'Seated cable or chest-supported row',
      photo: {src: commonsPhoto('Woman using a seated cable row machine at the gym.jpg'), alt: 'Adult using a seated cable row machine', credit: 'Miguel Angel Omaña Rojas', source: commonsPage('Woman using a seated cable row machine at the gym.jpg'), license: license('CC0 1.0','https://creativecommons.org/publicdomain/zero/1.0/')},
      setup: [
        'Set the seat or foot supports so the knees remain softly bent and the torso can stay tall.',
        'Choose a grip that keeps the wrists straight and shoulders comfortable.',
        'Begin with the arms extended and shoulder blades allowed to reach forward without rounding the low back.',
        'Brace lightly through the abdomen before starting the pull.'
      ],
      movement: [
        'Drive the elbows back while keeping them close to the body or slightly flared according to the handle.',
        'Finish when the hands approach the lower ribs and the shoulder blades have drawn together without shrugging.',
        'Keep the torso nearly still; a small natural movement is acceptable, but avoid rocking.',
        'Reach forward under control until the arms straighten and the shoulder blades glide apart.'
      ],
      mistakes: [
        'Turning the movement into a low-back swing.',
        'Pulling the shoulders up toward the ears.',
        'Bending the wrists or curling the handle rather than driving the elbows.',
        'Forcing the elbows far behind the torso after the shoulder blades have finished moving.'
      ],
      tips: [
        'Pause for one second at the contracted position to reduce momentum.',
        'Chest-supported versions can limit unwanted low-back movement.',
        'Match the handle and elbow path to the area you want to emphasize, but keep the shoulder comfortable.',
        'Record the attachment used because different handles can change the effective load.'
      ]
    },

    'bicep curl': {
      name: 'Bicep Curl', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Biceps brachii', 'Brachialis', 'Forearm flexors'], equipment: 'Cable, machine, or dumbbells',
      photo: {src: commonsPhoto('Elderly exercise.jpg'), alt: 'Older adult seated with a dumbbell during a strength exercise', credit: 'National Institutes of Health', source: commonsPage('Elderly exercise.jpg'), license: license('U.S. federal public domain','https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/United_States#Works_by_the_US_Federal_Government')},
      setup: [
        'Set the seat or cable height so the upper arms can remain stable throughout the repetition.',
        'Use a grip that keeps the wrists neutral rather than bent backward.',
        'Stand or sit tall with the ribs over the pelvis and shoulders relaxed.',
        'Start with the elbows almost straight but not forced into a painful lockout.'
      ],
      movement: [
        'Curl by bending the elbows while keeping the upper arms close to their starting position.',
        'Squeeze at the top without lifting the shoulders or driving the elbows forward excessively.',
        'Lower slowly until the elbows are nearly straight again.',
        'Exhale while curling and inhale while lowering.'
      ],
      mistakes: [
        'Swinging the torso to start the repetition.',
        'Allowing the wrists to fold backward under load.',
        'Letting the elbows travel far forward to shorten the hardest part of the movement.',
        'Dropping the weight quickly instead of controlling the eccentric phase.'
      ],
      tips: [
        'Use a lighter load if the final repetitions require body swing.',
        'A neutral grip can be more comfortable when the elbow or forearm is irritated.',
        'Machine settings should let the elbow line up with the machine’s pivot.',
        'Stop if pain is sharp at the elbow or if tingling develops in the hand.'
      ]
    },

    'leg press': {
      name: 'Leg Press', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Quadriceps', 'Gluteus maximus', 'Hamstrings'], equipment: 'Selectorized or plate-loaded leg-press machine',
      photo: {src: commonsPhoto('Marian-Leg-Press.jpg'), alt: 'Adult performing a leg press on a plate-loaded machine', credit: 'Abooyeah / AthletixVisuals Dubai', source: commonsPage('Marian-Leg-Press.jpg'), license: license('CC BY 4.0','https://creativecommons.org/licenses/by/4.0/')},
      setup: [
        'Place the feet about hip- to shoulder-width apart with the whole foot supported.',
        'Adjust the seat so the knees can bend comfortably without the pelvis curling away from the back pad.',
        'Keep the knees aligned with the toes rather than collapsing inward.',
        'Release the safety only after the feet and back are securely positioned.'
      ],
      movement: [
        'Press through the mid-foot and heel until the knees are nearly straight without locking them hard.',
        'Lower under control while keeping the hips and low back supported.',
        'Stop the descent before the pelvis tucks or the heels lift.',
        'Use the machine safeties and re-engage them before changing position.'
      ],
      mistakes: [
        'Lowering so deeply that the low back rounds off the pad.',
        'Knees collapsing inward or feet rolling onto their edges.',
        'Pushing on the knees with the hands to finish a repetition.',
        'Locking the knees forcefully at the top or bouncing out of the bottom.'
      ],
      tips: [
        'A slightly higher foot position usually increases hip contribution; machine geometry varies.',
        'Use a range that is controlled and symptom-free before adding weight.',
        'Record seat and foot placement because they substantially affect repeatability.',
        'For knee or hip injuries, use clinician-approved range and loading rather than a generic depth target.'
      ]
    },

    'leg extension': {
      name: 'Leg Extension', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Quadriceps'], equipment: 'Seated leg-extension machine',
      photo: {src: commonsPhoto('LegExtensionMachineExercise.JPG'), alt: 'Adult using a seated leg-extension machine', credit: 'George Stepanek; model credited as Emily', source: commonsPage('LegExtensionMachineExercise.JPG'), license: license('CC BY-SA 3.0','https://creativecommons.org/licenses/by-sa/3.0/')},
      setup: [
        'Align the machine pivot with the knee joint as closely as the equipment allows.',
        'Position the shin pad just above the ankle rather than on the foot.',
        'Keep the back supported and grip the handles lightly.',
        'Choose a starting angle and load that do not provoke knee pain.'
      ],
      movement: [
        'Straighten the knees smoothly while keeping the thighs on the seat.',
        'Stop just short of a forceful lockout.',
        'Pause briefly, then lower the pad under control to the selected starting angle.',
        'Keep both legs moving evenly on bilateral machines.'
      ],
      mistakes: [
        'Machine pivot not aligned with the knee.',
        'Kicking the weight up with momentum.',
        'Lifting the hips or arching the back to finish the repetition.',
        'Using a painful range because the machine allows it.'
      ],
      tips: [
        'Slower lowering can make a lighter weight challenging.',
        'For a sensitive knee, a clinician may prescribe a limited arc; follow that individualized range.',
        'Do not infer “no pain” from a blank pain field—record it explicitly when relevant.',
        'Keep the seat and shin-pad settings in notes for consistent comparisons.'
      ]
    },

    'seated leg curl': {
      name: 'Seated Leg Curl', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Hamstrings', 'Gastrocnemius'], equipment: 'Seated leg-curl machine',
      photo: {src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm/250px--Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm.jpg', alt: 'Still from a public-domain CDC demonstration of a leg-curl machine', credit: 'Centers for Disease Control and Prevention', source: commonsPage('Muscle Strengthening at the Gym - Leg Curl.webm'), license: license('U.S. federal public domain','https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/United_States#Works_by_the_US_Federal_Government')},
      setup: [
        'Align the machine pivot with the knee joint and secure the thigh pad without excessive pressure.',
        'Place the lower-leg pad above the heel or at the lower calf according to the machine design.',
        'Sit fully back with the torso supported and knees beginning in a comfortable extended position.',
        'Point the toes naturally; avoid forcing them rigidly up or down.'
      ],
      movement: [
        'Curl the lower legs down and back by bending the knees while keeping the thighs under the restraint.',
        'Pause when the hamstrings are fully shortened without the hips lifting.',
        'Return slowly until the knees are nearly straight or the approved range ends.',
        'Keep the motion smooth and equal on both sides.'
      ],
      mistakes: [
        'Allowing the hips to lift or slide forward.',
        'Using momentum and letting the stack bounce.',
        'Positioning the pad directly on the Achilles tendon or heel.',
        'Forcing the knee into a painful end range.'
      ],
      tips: [
        'A slightly dorsiflexed ankle can increase calf contribution; keep the ankle position consistent.',
        'Use controlled lowering rather than chasing heavier weight.',
        'Record unilateral differences rather than averaging them away.',
        'Stop for sharp pain behind the knee or sudden hamstring pain.'
      ]
    },

    'shoulder press': {
      name: 'Shoulder Press', profile: 'strength', level: 'Intermediate unless cleared for overhead work',
      targets: ['Deltoids', 'Triceps', 'Upper chest'], equipment: 'Seated shoulder-press machine',
      photo: {src: commonsPhoto('ShoulderPressMachineExercise.JPG'), alt: 'Adult using a seated shoulder-press machine', credit: 'George Stepanek; model credited as Emily', source: commonsPage('ShoulderPressMachineExercise.JPG'), license: license('CC BY-SA 3.0','https://creativecommons.org/licenses/by-sa/3.0/')},
      setup: [
        'Only use overhead pressing when it is compatible with current shoulder restrictions.',
        'Adjust the seat so the handles start around ear or shoulder height, not far below the shoulders.',
        'Use a neutral grip when available and comfortable.',
        'Keep the feet planted, ribs controlled, and head supported without pushing it forward.'
      ],
      movement: [
        'Press upward in the machine’s path without shrugging aggressively.',
        'Stop before a hard elbow lockout.',
        'Lower under control to the comfortable starting point.',
        'Keep the forearms roughly vertical from the front view.'
      ],
      mistakes: [
        'Arching the low back and flaring the ribs to create range.',
        'Lowering farther than the shoulder can control comfortably.',
        'Forcing the elbows directly out to the sides when a slightly forward path feels better.',
        'Ignoring sharp pain, catching, or loss of strength.'
      ],
      tips: [
        'For shoulder recovery, a landmine press or lower-angle press may be a better substitution if approved.',
        'Start lighter than horizontal pressing because overhead tolerance can differ substantially.',
        'Record the grip and seat setting.',
        'ZEKE should never treat this guide as medical clearance.'
      ]
    },

    'tricep press': {
      name: 'Tricep Press', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Triceps'], equipment: 'Cable pressdown or triceps machine',
      photo: {src: commonsPhoto('Tricep Pull down.jpg'), alt: 'Cable triceps pulldown station in a gym', credit: 'Aliva Sahoo', source: commonsPage('Tricep Pull down.jpg'), license: license('CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/')},
      setup: [
        'Set the cable high and choose a straight bar, angled bar, or rope that feels comfortable.',
        'Stand tall with the elbows close to the sides and shoulders relaxed.',
        'Take a stable stance and keep the wrists in line with the forearms.',
        'Begin with the elbows bent without letting the shoulders roll forward.'
      ],
      movement: [
        'Extend the elbows until the arms are nearly straight.',
        'Keep the upper arms mostly still beside the torso.',
        'Return under control until the forearms rise without the elbows drifting far forward.',
        'Use a smooth tempo and avoid leaning body weight onto the attachment.'
      ],
      mistakes: [
        'Turning the movement into a shoulder extension or full-body push.',
        'Flaring the elbows widely.',
        'Bending the wrists at the bottom.',
        'Letting the cable snap back between repetitions.'
      ],
      tips: [
        'A rope permits a small natural separation at the bottom.',
        'Use a lighter load if the elbows cannot stay stable.',
        'Change the attachment before forcing an uncomfortable wrist position.',
        'Stop for sharp elbow pain or hand numbness.'
      ]
    },

    'pec fly': {
      name: 'Pec Fly', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Pectoralis major', 'Anterior deltoids'], equipment: 'Pec-deck or machine fly',
      photo: {src: commonsPhoto('Pec deck Fly.jpg'), alt: 'Pec-deck fly machine in a gym', credit: 'Aliva Sahoo', source: commonsPage('Pec deck Fly.jpg'), license: license('CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/')},
      setup: [
        'Adjust the seat so the elbows or handles align near mid-chest height.',
        'Set a starting range that does not pull the shoulders uncomfortably behind the torso.',
        'Keep the back and head supported with feet flat.',
        'Maintain a soft bend in the elbows on handle-style machines.'
      ],
      movement: [
        'Bring the arms toward each other in a smooth arc.',
        'Finish by contracting the chest without letting the shoulders roll forward.',
        'Return slowly until a comfortable chest stretch is reached.',
        'Keep the same elbow angle throughout handle-style repetitions.'
      ],
      mistakes: [
        'Starting from excessive shoulder extension.',
        'Shrugging or reaching the shoulders forward at the finish.',
        'Bending and straightening the elbows to move the weight.',
        'Allowing the stack to pull the arms backward abruptly.'
      ],
      tips: [
        'This movement can be provocative for some shoulder injuries; use clinician-approved range.',
        'A chest press may be easier to control than a fly during recovery.',
        'Use a modest load and emphasize a slow return.',
        'Record the start-position setting because it changes shoulder demand.'
      ]
    },

    'abdominal': {
      name: 'Abdominal Machine', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Rectus abdominis', 'Obliques as stabilizers'], equipment: 'Selectorized abdominal-crunch machine',
      photo: {src: commonsPhoto('Abdominal Exercise.jpg'), alt: 'Adult performing an abdominal crunch variation', credit: 'Tyler Read / PTPioneer', source: commonsPage('Abdominal Exercise.jpg'), license: license('CC BY 2.0','https://creativecommons.org/licenses/by/2.0/')},
      setup: [
        'Adjust the seat and pads so the machine’s pivot corresponds with the intended trunk motion.',
        'Place the feet securely and grip the handles without pulling with the arms.',
        'Begin in a neutral, supported position rather than an exaggerated back arch.',
        'Choose a load that permits the pelvis and rib cage to move under control.'
      ],
      movement: [
        'Bring the ribs toward the pelvis by flexing the trunk rather than pulling with the arms.',
        'Exhale through the crunch and pause briefly in the shortened position.',
        'Return slowly until the torso is upright or the selected range ends.',
        'Keep the hips in contact with the seat.'
      ],
      mistakes: [
        'Yanking on the handles with the arms.',
        'Using hip momentum or bouncing out of the extended position.',
        'Holding the breath throughout the set.',
        'Extending the low back beyond a comfortable range.'
      ],
      tips: [
        'Think about closing the distance between the lower ribs and pelvis.',
        'A slower tempo often works better than increasing load rapidly.',
        'Avoid bearing down or breath-holding if a clinician has advised against it.',
        'For back pain, use a clinician-approved alternative rather than pushing through symptoms.'
      ]
    },

    'back extension': {
      name: 'Back Extension', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Spinal erectors', 'Gluteus maximus', 'Hamstrings'], equipment: 'Back-extension machine or Roman chair',
      photo: {src: commonsPhoto('Athlete blonde girl doing leg and body exercise on machine.jpg'), alt: 'Adult performing a supported back-extension exercise', credit: 'Nenad Stojkovic', source: commonsPage('Athlete blonde girl doing leg and body exercise on machine.jpg'), license: license('CC BY 2.0','https://creativecommons.org/licenses/by/2.0/')},
      setup: [
        'Adjust the pad so the hips can hinge without the pad pressing into the abdomen.',
        'Secure the feet and begin with a neutral spine.',
        'Cross the arms over the chest or use the machine handles before adding external weight.',
        'Choose a range compatible with any back or hip restrictions.'
      ],
      movement: [
        'Hinge forward from the hips while keeping the trunk controlled.',
        'Extend until the body is roughly straight; do not force into a large backward arch.',
        'Squeeze the glutes and return smoothly.',
        'Keep the neck in line with the torso.'
      ],
      mistakes: [
        'Hyperextending the low back at the top.',
        'Rounding abruptly or dropping into the bottom.',
        'Using momentum instead of hip and trunk control.',
        'Holding a heavy plate before mastering bodyweight range.'
      ],
      tips: [
        'A hip-dominant hinge usually spreads work across the glutes and hamstrings.',
        'Stop for radiating pain, numbness, or sudden weakness.',
        'Use a shorter range if the low back begins to dominate.',
        'Record whether the machine or Roman-chair version was used.'
      ]
    },

    'hip abduction': {
      name: 'Hip Abduction', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Gluteus medius', 'Gluteus minimus', 'Upper gluteus maximus'], equipment: 'Seated hip-abduction machine',
      photo: {src: commonsPhoto('Hip abductor machine.jpg'), alt: 'Hip-abduction machine in a gym', credit: 'Teemeah', source: commonsPage('Hip abductor machine.jpg'), license: license('CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/')},
      setup: [
        'Sit with the pelvis centered and back supported.',
        'Position the pads against the outside of the thighs, not directly on the knees.',
        'Select a starting width that is comfortable at the hips.',
        'Keep the feet on the machine supports and grip the handles lightly.'
      ],
      movement: [
        'Press the knees outward smoothly against the pads.',
        'Pause briefly without rolling the pelvis backward.',
        'Return under control until the selected start position is reached.',
        'Keep the motion symmetrical unless performing an intentionally unilateral variation.'
      ],
      mistakes: [
        'Using momentum and bouncing the pads.',
        'Leaning far back or forward solely to move more weight.',
        'Allowing the pelvis to rotate or shift from side to side.',
        'Forcing a range that pinches the front or side of the hip.'
      ],
      tips: [
        'A slightly forward torso may change which fibers feel most active, but keep the position consistent.',
        'Use the full comfortable range before adding weight.',
        'Log side-specific pain rather than recording only a combined value.',
        'This exercise is not a substitute for individualized hip rehabilitation.'
      ]
    },

    'calf raise': {
      name: 'Calf Raise', profile: 'strength', level: 'Beginner to advanced',
      targets: ['Gastrocnemius', 'Soleus'], equipment: 'Standing or seated calf-raise machine',
      photo: {src: commonsPhoto('SeatedCalfRaiseMachineExercise.JPG'), alt: 'Adult performing a seated calf raise on a machine', credit: 'George Stepanek; model credited as Emily', source: commonsPage('SeatedCalfRaiseMachineExercise.JPG'), license: license('CC BY-SA 3.0','https://creativecommons.org/licenses/by-sa/3.0/')},
      setup: [
        'Place the balls of the feet securely on the platform with the heels free to move.',
        'Position the knee or shoulder pad so it is secure without painful pressure.',
        'Use the handles for balance and keep the ankles aligned over the feet.',
        'Begin with a controlled stretch rather than dropping into the bottom.'
      ],
      movement: [
        'Rise onto the balls of the feet as high as can be controlled.',
        'Pause briefly at the top without rolling the ankles outward.',
        'Lower slowly until a comfortable calf stretch is reached.',
        'Keep pressure through the big-toe and little-toe sides of the forefoot.'
      ],
      mistakes: [
        'Bouncing rapidly through a short range.',
        'Letting the ankles collapse inward or outward.',
        'Using the knees and hips to drive a standing repetition.',
        'Dropping the heels below a pain-free range.'
      ],
      tips: [
        'Straight-knee versions emphasize gastrocnemius; bent-knee versions increase soleus contribution.',
        'Use a pause at the top and bottom to reduce momentum.',
        'Record standing versus seated because loads are not directly comparable.',
        'Progress cautiously after Achilles or calf injury.'
      ]
    },

    'stair climber': {
      name: 'Stair Climber', profile: 'cardio', level: 'Beginner to advanced',
      targets: ['Cardiovascular endurance', 'Glutes', 'Quadriceps', 'Calves'], equipment: 'Rotating-step stair machine',
      photo: {src: commonsPhoto('Man on stair machine.jpg'), alt: 'Adult exercising on a stair-climbing machine', credit: 'Ernie Branson / National Cancer Institute', source: commonsPage('Man on stair machine.jpg'), license: license('Public domain','https://creativecommons.org/publicdomain/mark/1.0/')},
      setup: [
        'Step on while the machine is stopped or at its lowest safe speed.',
        'Stand tall with the whole foot landing on each step when possible.',
        'Use the rails for balance rather than supporting most of your body weight.',
        'Begin at a level that permits steady breathing and safe foot placement.'
      ],
      movement: [
        'Take even steps and keep the knees tracking over the feet.',
        'Maintain an upright torso with a slight natural forward lean from the ankles.',
        'Increase level gradually rather than suddenly chasing cadence.',
        'Use the stop controls before stepping off.'
      ],
      mistakes: [
        'Hanging heavily from the rails or leaning the forearms on the console.',
        'Taking tiny toe-only steps that let the heels remain unsupported.',
        'Looking down continuously and rounding the upper back.',
        'Continuing when dizzy, unsteady, or unable to place the feet reliably.'
      ],
      tips: [
        'Track duration, steps, level, heart rate, and perceived effort when available.',
        'A blank heart-rate field means not recorded—not zero.',
        'Short intervals can increase intensity without extending the session.',
        'Use a lower level when fatigue changes foot placement or posture.'
      ]
    },

    'treadmill': {
      name: 'Treadmill', profile: 'cardio', level: 'Beginner to advanced',
      targets: ['Cardiovascular endurance', 'Walking or running economy', 'Lower body'], equipment: 'Motorized treadmill',
      photo: {src: commonsPhoto('Exercise Treadmill Convey Motion.jpg'), alt: 'Adult running on a treadmill', credit: 'Larry D. Moore', source: commonsPage('Exercise Treadmill Convey Motion.jpg'), license: license('CC BY 4.0','https://creativecommons.org/licenses/by/4.0/')},
      setup: [
        'Stand on the side rails while starting the belt at a slow speed.',
        'Attach the emergency-stop clip when the machine provides one.',
        'Choose speed and incline that permit a stable, natural stride.',
        'Keep the screen and controls within easy reach without leaning on them.'
      ],
      movement: [
        'Walk or run near the middle of the belt with relaxed arms.',
        'Keep the gaze forward and allow the feet to land naturally under the body.',
        'Adjust speed or incline in small increments.',
        'Slow to an easy walk before stopping and stepping off.'
      ],
      mistakes: [
        'Holding the front rail while using a speed or incline that is too high.',
        'Drifting too close to the front cover or too far toward the rear.',
        'Increasing incline without adapting stride and posture.',
        'Jumping onto or off a moving belt.'
      ],
      tips: [
        'Record speed, incline, duration, distance, and heart rate separately when available.',
        'Do not convert missing distance or heart-rate data into zero.',
        'Use incline rather than speed when impact needs to stay lower and walking remains comfortable.',
        'Stop for chest pain, faintness, or unusual shortness of breath.'
      ]
    },

    'stationary bike': {
      name: 'Stationary Bike', profile: 'cardio', level: 'Beginner to advanced',
      targets: ['Cardiovascular endurance', 'Quadriceps', 'Glutes'], equipment: 'Upright or recumbent exercise bike',
      photo: {src: commonsPhoto('Stationary bicycle.jpg'), alt: 'Stationary exercise bicycle', credit: 'Kirk', source: commonsPage('Stationary bicycle.jpg'), license: license('Public domain','https://creativecommons.org/publicdomain/mark/1.0/')},
      setup: [
        'Adjust the seat so the knee remains slightly bent at the bottom of the pedal stroke.',
        'Center the feet on the pedals and secure straps without cutting off circulation.',
        'Set handle position so the shoulders remain relaxed.',
        'Begin with low resistance while checking hip and knee comfort.'
      ],
      movement: [
        'Pedal in smooth circles at a sustainable cadence.',
        'Keep the knees tracking forward rather than bowing inward or outward.',
        'Increase resistance in small steps while maintaining control.',
        'Cool down at lower resistance before stopping.'
      ],
      mistakes: [
        'Seat too low, causing excessive knee bend and rocking hips.',
        'Seat too high, causing the hips to sway to reach the pedals.',
        'Gripping the handlebars tightly and shrugging the shoulders.',
        'Using high resistance that turns the pedal stroke into a slow, jerky push.'
      ],
      tips: [
        'Recumbent bikes can provide more trunk support.',
        'Track duration, resistance or level, distance, cadence, heart rate, and RPE when available.',
        'A zero resistance entry is different from leaving resistance blank.',
        'Use clinician guidance after knee, hip, or cardiac events.'
      ]
    }
  };

  const aliases = {
    'independent bicep curl': 'bicep curl', 'machine bicep curl': 'bicep curl', 'cable curl': 'bicep curl',
    'rowing machine': 'seated row', 'cable row': 'seated row',
    'climbmill': 'stair climber', 'stairmaster': 'stair climber',
    'bike': 'stationary bike', 'exercise bike': 'stationary bike', 'recumbent bike': 'stationary bike',
    'abdominal crunch': 'abdominal', 'ab crunch': 'abdominal', 'abdominal machine': 'abdominal',
    'triceps press': 'tricep press', 'tricep pressdown': 'tricep press', 'triceps pressdown': 'tricep press',
    'pec deck': 'pec fly', 'chest fly': 'pec fly',
    'glute lift': 'leg press', 'glute machine': 'hip abduction',
    'hamstring curl': 'seated leg curl', 'leg curl': 'seated leg curl',
    'shoulder pt': 'shoulder press', 'shoulder mobility': 'shoulder press'
  };

  const normalize = (value) => String(value || '').toLowerCase().replace(/[®™]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const fallback = (exercise) => ({
    name: exercise || 'Exercise', profile: 'strength', level: 'Varies',
    targets: ['Guide not yet reviewed for this exact exercise'], equipment: 'Confirm the exact machine or variation', photo: null,
    setup: ['Match the machine pivot and pads to the working joints.', 'Choose a stable starting position and a conservative load.', 'Keep the intended body segments supported.', 'Confirm the exact exercise name before relying on substitutions.'],
    movement: ['Move through a controlled, comfortable range.', 'Keep breathing and avoid momentum.', 'Return the weight under control.', 'Stop for sharp, catching, or increasing pain.'],
    mistakes: ['Treating a different machine variation as identical.', 'Using load that changes technique.', 'Assuming missing pain or effort data means zero.', 'Continuing despite concerning symptoms.'],
    tips: ['This fallback is not a reviewed exercise-specific guide.', 'Use the custom-exercise name to help ZEKE match the correct guide later.', 'Follow clinician restrictions when injured.', 'Record equipment and settings in notes.']
  });

  window.ZekeExerciseGuides = Object.freeze({
    get(exercise) {
      const key = normalize(exercise);
      return guides[aliases[key] || key] || fallback(exercise);
    },
    has(exercise) {
      const key = normalize(exercise);
      return Boolean(guides[aliases[key] || key]);
    },
    count: Object.keys(guides).length
  });
})();
