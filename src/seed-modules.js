const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ISSB Training Modules data...');

  // 1. Get or create a Category for Non-Verbal IQ
  let nonVerbalCat = await prisma.examCategory.findFirst({
    where: { name: { contains: 'Non-Verbal', mode: 'insensitive' } }
  });
  if (!nonVerbalCat) {
    let generalCat = await prisma.examCategory.findFirst();
    if (!generalCat) {
      generalCat = await prisma.examCategory.create({
        data: { name: 'ISSB Screening IQ', code: 'ISSB_IQ', description: 'Screening Intelligence Examination' }
      });
    }
    nonVerbalCat = generalCat;
  }

  // 2. Seed Non-Verbal IQ Questions (Spatial, Matrices, Pattern Analogy)
  const nonVerbalQuestions = [
    {
      questionText: 'Which figure completes the pattern in the 3x3 matrix where each row rotates clockwise by 90 degrees and adds one dot inside the triangle?',
      options: { A: 'Triangle pointing right with 3 dots', B: 'Triangle pointing down with 2 dots', C: 'Triangle pointing up with 4 dots', D: 'Triangle pointing left with 1 dot' },
      correctAnswer: 'A',
      explanation: 'In each row, the geometric figure rotates 90° clockwise per column. The internal dots increment by +1 (1 dot in col 1, 2 dots in col 2, 3 dots in col 3). Therefore the final cell requires a triangle oriented right with 3 internal dots.',
      difficulty: 'MEDIUM',
      iqSection: 'NON_VERBAL'
    },
    {
      questionText: 'Find the odd figure out from the following spatial cube orientations: Cube with dot on top, cross on right, square on front.',
      options: { A: 'Figure 1: Dot adjacent to Cross', B: 'Figure 2: Square opposite to Cross', C: 'Figure 3: Dot opposite to Cross', D: 'Figure 4: Square adjacent to Dot' },
      correctAnswer: 'C',
      explanation: 'In the base spatial net, the dot and cross share an edge (adjacent faces). In Figure 3, the dot and cross are rendered on opposite faces, which violates spatial continuity.',
      difficulty: 'HARD',
      iqSection: 'NON_VERBAL'
    },
    {
      questionText: 'Analogy Pattern: [Circle inside Square : Square inside Circle] :: [Triangle inside Hexagon : ?]',
      options: { A: 'Hexagon inside Triangle', B: 'Hexagon inside Square', C: 'Triangle inside Circle', D: 'Circle inside Hexagon' },
      correctAnswer: 'A',
      explanation: 'The spatial relationship reverses outer and inner polygons. Hexagon inside Triangle is the exact geometric inversion.',
      difficulty: 'EASY',
      iqSection: 'NON_VERBAL'
    },
    {
      questionText: 'Paper Folding Sequence: A square sheet is folded in half diagonally, then in half again into a triangle, and a semicircular notch is cut on the hypotenuse. What does the unfolded sheet look like?',
      options: { A: 'A central diamond cutout', B: 'Four circular cutouts on outer edges', C: 'A central circular hole and 4 corner cuts', D: 'Two oval notches' },
      correctAnswer: 'A',
      explanation: 'Unfolding twice reflects the semicircular cut across both diagonal axes of symmetry, merging into a central diamond/circular aperture.',
      difficulty: 'MEDIUM',
      iqSection: 'NON_VERBAL'
    },
    {
      questionText: 'Matrix Completion: Row 1: 3 solid lines; Row 2: 2 solid lines, 1 dashed line; Row 3: 1 solid line, 1 dashed line, [ ? ]. What completes the third row?',
      options: { A: '2 dashed lines', B: '1 solid line', C: '3 wavy lines', D: '1 dotted circle' },
      correctAnswer: 'A',
      explanation: 'Each row replaces one solid line with a dashed line. The final progression requires 2 dashed lines to maintain line degradation symmetry.',
      difficulty: 'EASY',
      iqSection: 'NON_VERBAL'
    }
  ];

  for (const q of nonVerbalQuestions) {
    const existing = await prisma.question.findFirst({ where: { questionText: q.questionText } });
    if (!existing) {
      await prisma.question.create({
        data: {
          questionText: q.questionText,
          categoryId: nonVerbalCat.id,
          iqSection: 'NON_VERBAL',
          difficulty: q.difficulty,
          questionType: 'MCQ',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          timeLimitSec: 30,
          isPublished: true,
          options: {
            create: Object.entries(q.options).map(([k, v]) => ({ key: k, text: v }))
          }
        }
      });
    }
  }
  console.log('Seeded Non-Verbal questions.');

  // 3. Seed PPDT Scenarios
  const ppdtScenarios = [
    {
      title: 'Rural Flash Flood & Damaged River Bridge',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      description: 'A rural riverside path where flood waters have washed away the wooden footpath. 3 villagers stand by the edge with rope and timber.',
      characterHints: JSON.stringify([
        { age: '24', sex: 'M', mood: '+', role: 'Main Protagonist (Rahim, Engineering Cadet)' },
        { age: '45', sex: 'M', mood: '0', role: 'Local Union Ward Member' },
        { age: '20', sex: 'M', mood: '+', role: 'Volunteer helper' }
      ]),
      modelStory: 'Rahim, a 24-year-old engineering university cadet on vacation in Sunamganj, noticed the primary culvert bridge damaged by sudden monsoon runoff, cutting off 200 school children and elderly patients. Quickly assessing the river span (18 feet), Rahim mobilized the local youth club, acquired sturdy bamboo poles and nylon mooring rope from the river ghat, and applied cantilever bridging principles. Within three hours, a secure emergency footbridge with safety guide ropes was erected. He posted volunteers at both ends and informed the Upazila Nirbahi Officer (UNO) for permanent culvert repairs.',
      tips: 'Ensure the protagonist has clear initiative, plans logically with available local materials, exhibits empathy, and completes the action rather than just calling for help.',
      difficulty: 'MEDIUM'
    },
    {
      title: 'Night Railway Track Obstacle / Derailment Prevention',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80',
      description: 'Hazy dusk scene near railway tracks. Two young men observe a fallen boulder and dislodged sleeper plates before an incoming passenger express.',
      characterHints: JSON.stringify([
        { age: '23', sex: 'M', mood: '+', role: 'Protagonist (Tanvir, University Student)' },
        { age: '22', sex: 'M', mood: '0', role: 'Companion' }
      ]),
      modelStory: 'Tanvir, returning home along the railway embankment near Sreemangal, noticed a heavy boulder dislodged onto the mainline tracks following heavy rain, with the Upaban Express scheduled within 20 minutes. Realizing clearing the boulder alone was impossible, Tanvir instructed his friend to sprint toward the upcoming curve with a high-visibility red shirt and mobile flashlight to signal danger 500 meters ahead, while he contacted the nearest station master via emergency hotline. The loco master braked safely, and track maintenance crew safely cleared the obstruction with crowbars.',
      tips: 'Always display quick situational awareness, resourcefulness (torchlight/red garment signals), safety protocols, and teamwork under time pressure.',
      difficulty: 'HARD'
    },
    {
      title: 'Community Cyclone Shelter Evacuation Preparation',
      imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
      description: 'Coastal settlement under dark storm clouds. Young community organizer addressing a small group of coastal residents near a motorized boat.',
      characterHints: JSON.stringify([
        { age: '25', sex: 'M', mood: '+', role: 'Protagonist (Adnan, Red Crescent Volunteer)' },
        { age: '50', sex: 'M', mood: '-', role: 'Reluctant Fisherman' }
      ]),
      modelStory: 'Adnan, a coastal community youth leader in Barguna, received Signal 8 warning of an approaching cyclone. He immediately organized a 6-person evacuation team, mapped out elderly and pregnant villagers, and arranged two trawlers to transport livestock to highland enclosures. He patiently convinced skeptical elders about storm surge risks, stockpiled water purification tablets and emergency rations at the 2-storey cyclone shelter, and ensured all families were housed safely before the storm made landfall.',
      tips: 'Focus on proactive leadership, persuasion without conflict, meticulous logistics, and genuine care for community safety.',
      difficulty: 'EASY'
    }
  ];

  for (const s of ppdtScenarios) {
    const existing = await prisma.ppdtScenario.findFirst({ where: { title: s.title } });
    if (!existing) {
      await prisma.ppdtScenario.create({ data: { ...s, isPublished: true } });
    }
  }
  console.log('Seeded PPDT scenarios.');

  // 4. Seed 60 Official ISSB WAT Words
  const watWords = [
    'LEADER', 'DUTY', 'WAR', 'BRAVE', 'FEAR', 'DEFEAT', 'SACRIFICE', 'ATTACK', 'PEACE', 'BLOOD',
    'HONOR', 'RESPONSIBILITY', 'FAILURE', 'VICTORY', 'ORDER', 'DEATH', 'CRISIS', 'WEAPON', 'DISCIPLINE', 'SOLDIER',
    'MISSION', 'COURAGE', 'TEAM', 'OBEDIENCE', 'DIFFICULTY', 'DANGER', 'INITIATIVE', 'ALERT', 'COMBAT', 'FLAG',
    'LOYALTY', 'PRESSURE', 'STRENGTH', 'DECISION', 'SMILE', 'ENEMY', 'CHALLENGE', 'SUCCESS', 'PATRIOT', 'DEFENSE',
    'RESOLVE', 'HELP', 'STRUGGLE', 'CALM', 'BORDER', 'COMMAND', 'RUSH', 'SECURE', 'RALLY', 'STEADFAST',
    'UNITY', 'TACTIC', 'PRIDE', 'FORCE', 'HERO', 'RISK', 'JUSTICE', 'TARGET', 'HONEST', 'VICTORIOUS'
  ];

  for (const w of watWords) {
    const existing = await prisma.psychologyItem.findFirst({ where: { testType: 'WAT', promptText: w } });
    if (!existing) {
      await prisma.psychologyItem.create({
        data: {
          testType: 'WAT',
          promptText: w,
          timeLimitSec: 15,
          isPublished: true
        }
      });
    }
  }
  console.log('Seeded 60 WAT words.');

  // 5. Seed TAT, SCT, SRT, SD Psychology Items
  const psychOtherItems = [
    // TAT
    {
      testType: 'TAT',
      promptText: 'TAT Slide #1: A young military cadet stands beside a study table reviewing tactical charts while looking determinedly toward the horizon.',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      timeLimitSec: 240,
      sampleAnswer: 'Cadet Farhan preparing his graduation thesis on modern counter-insurgency tactics. By analyzing previous exercise data and consulting mentors, he developed a streamlined communications framework that was adopted into academy training.',
      category: 'ACHIEVEMENT'
    },
    {
      testType: 'TAT',
      promptText: 'TAT Slide #2: A group of three colleagues examining an engine blueprint in a naval dockyard.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      timeLimitSec: 240,
      sampleAnswer: 'Sub-Lieutenant Asif collaborating with senior engineers to overhaul a propulsion valve ahead of scheduled deployment, ensuring sea readiness ahead of time.',
      category: 'TEAMWORK'
    },
    // SCT
    {
      testType: 'SCT',
      promptText: 'When the unexpected crisis occurred, the commander...',
      timeLimitSec: 30,
      sampleAnswer: 'calmly evaluated options and led the unit to safety.',
      category: 'CRISIS_MANAGEMENT'
    },
    {
      testType: 'SCT',
      promptText: 'In challenging atmospheric conditions, a disciplined soldier...',
      timeLimitSec: 30,
      sampleAnswer: 'maintains high focus and executes the mission relentlessly.',
      category: 'PERSEVERANCE'
    },
    {
      testType: 'SCT',
      promptText: 'When his team was facing imminent defeat, he...',
      timeLimitSec: 30,
      sampleAnswer: 'rallied their spirits and reversed the momentum with tactical initiative.',
      category: 'LEADERSHIP'
    },
    {
      testType: 'SCT',
      promptText: 'My deepest ambition as an officer is to...',
      timeLimitSec: 30,
      sampleAnswer: 'serve the sovereignty of Bangladesh and inspire my subordinates to excellence.',
      category: 'MOTIVATION'
    },
    // SRT
    {
      testType: 'SRT',
      promptText: 'You are leading a 4-man reconnaissance patrol in hilly forest terrain when one patrol member sustains an ankle fracture and your primary radio fails. You...',
      timeLimitSec: 60,
      sampleAnswer: 'Apply improvised splint to the fracture, distribute his load among the team, navigate using map and compass to the designated fallback rendezvous, and dispatch visual mirror/smoke signals.',
      category: 'TACTICAL_CRISIS'
    },
    {
      testType: 'SRT',
      promptText: 'During a live firing exercise, a cadet accidentally drops a live hand grenade near the trench dugout with 5 recruits present. You...',
      timeLimitSec: 45,
      sampleAnswer: 'Shout "GRENADE", kick or sweep it into the grenade sump pit, and push nearby cadets down to prone defensive posture.',
      category: 'RAPID_SAFETY'
    },
    {
      testType: 'SRT',
      promptText: 'You are on leave when you notice an electrical short circuit fire breaking out on the 3rd floor of a crowded market. You...',
      timeLimitSec: 60,
      sampleAnswer: 'Trigger the building fire alarm, cut off the main breaker switch, lead evacuation through stairs, and operate fire extinguishers on the source while alerting Fire Service.',
      category: 'CIVIL_COURAGE'
    },
    // SD
    {
      testType: 'SD',
      promptText: 'What your parents think of you: Summarize their view on your character, discipline, and responsibility.',
      timeLimitSec: 300,
      sampleAnswer: 'My parents view me as responsible, respectful, and dependable. They appreciate my calm temperament and trust me to support the family during tough decisions.',
      category: 'PARENTS_VIEW'
    },
    {
      testType: 'SD',
      promptText: 'What your teachers and instructors think of you.',
      timeLimitSec: 300,
      sampleAnswer: 'Teachers regard me as an inquisitive, punctual, and hardworking student who actively participates in co-curricular debates and sports.',
      category: 'TEACHERS_VIEW'
    }
  ];

  for (const item of psychOtherItems) {
    const existing = await prisma.psychologyItem.findFirst({ where: { testType: item.testType, promptText: item.promptText } });
    if (!existing) {
      await prisma.psychologyItem.create({ data: { ...item, isPublished: true } });
    }
  }
  console.log('Seeded Psychology TAT, SCT, SRT, SD items.');

  // 6. Seed GTO Ground Tasks & MPE
  const gtoTasks = [
    {
      taskType: 'PGT',
      title: 'Stage 1: The 18-Foot Gap & Cantilever Bridge',
      description: 'Cross an 18-foot pit with two unpainted intermediate wooden pilings. Red stripes on the bottom 4 feet indicate deep water/danger.',
      mapImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      resources: JSON.stringify(['1x 10-foot Wooden Plank', '1x 8-foot Round Log', '2x 15-foot Manila Ropes', '1x 20kg Ammo Box (Load)']),
      rules: JSON.stringify([
        'Rule of Color: Red is out of bounds; White is safe for men and load.',
        'Rule of Rigidity: Cannot tie two loose wooden members together without intermediate support.',
        'Rule of Load: The 20kg ammo box must never touch the ground.',
        'Rule of Distance: No cadet can jump greater than 4 feet.'
      ]),
      modelSolution: 'Place the 10-foot plank between Start Line and Pillar 1. Anchor the start end with the weight of two cadets (Class-1 lever). Cadet 3 crosses with the 8-foot log and places it from Pillar 1 to Finish Line. Ropes secure the junction. The ammo box is passed hand-to-hand safely.',
      timeAllowedMin: 35
    },
    {
      taskType: 'COMMAND_TASK',
      title: 'Water Reservoir Pipeline Valve Repair',
      description: 'You are commander. A ruptured fuel valve on an elevated platform 12 feet away is leaking. You must guide your 2 chosen subordinates across using only a single wooden spar and rope without speaking loudly.',
      resources: JSON.stringify(['1x 12-foot Wooden Spar', '1x 20-foot Rope', '1x Adjustable Wrench']),
      rules: JSON.stringify([
        'Only Commander gives instructions.',
        'If a subordinate touches red, they must return to start.',
        'Time limit strictly 15 minutes.'
      ]),
      modelSolution: 'Commander briefs subordinates beforehand. Subordinate 1 holds the fulcrum anchor. Subordinate 2 carries the wrench across the cantilever spar to turn the valve. Commander supervises from the forward support.',
      timeAllowedMin: 15
    },
    {
      taskType: 'MPE',
      title: 'Border Outpost "Operation Sentinel" Supply Ambush',
      description: 'You are Lieutenant commanding a border patrol post at 14:00 hours. An urgent message reveals: (1) An injured soldier at Outpost Charlie needs blood transfusion by 16:30 hours; (2) Bandits plan to dynamite the railway bridge at 16:00 hours; (3) Fuel depot catches fire at 15:30. Resources available: 1x Speedboat (30 km/h), 1x Jeep (40 km/h), 8 soldiers, 2 first-aid kits.',
      mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
      resources: JSON.stringify(['1x Speedboat (30 km/h)', '1x Military 4x4 Jeep (40 km/h)', '8x Armed Soldiers', '2x Tactical Radios']),
      rules: JSON.stringify([
        'Calculate exact time and distance for each detachment.',
        'Never split into single-man units; minimum 2 men per detachment.',
        'Prioritize human life and critical infrastructure.'
      ]),
      modelSolution: 'Detachment A (Jeep, 4 soldiers, Medic): Dispatched to Outpost Charlie (20 km along road = 30 mins, arrives 14:30, well ahead of 16:30 deadline). Detachment B (Speedboat, 4 soldiers): Rushes downstream (15 km = 30 mins) to secure railway bridge by 14:45. Alert Local Police for depot.',
      timeAllowedMin: 30
    },
    {
      taskType: 'LECTURETTE',
      title: 'Modern Drone Warfare & Counter-UAS Strategies',
      description: 'Give a 3-minute structured lecture on the impact of FPV drones and loitering munitions in contemporary battlefield doctrine.',
      modelSolution: 'Introduction (30s): Evolution from reconnaissance to lethal loitering munitions. Main Body (2 mins): Asymmetric warfare advantages, electronic warfare jamming countermeasures, and air defense integration. Conclusion (30s): Strategic imperative for Bangladesh Armed Forces.',
      timeAllowedMin: 3
    },
    {
      taskType: 'GD',
      title: 'Cyber Warfare vs Conventional Kinetic Force in 21st Century',
      description: 'Discuss whether investment should prioritize conventional armored/naval capabilities or cyber defense and satellite surveillance.',
      modelSolution: 'Balanced approach: Conventional deterrence secures national borders physically, while cyber warfare prevents critical infrastructure decapitation. Synergistic tri-service integration is vital.',
      timeAllowedMin: 15
    }
  ];

  for (const t of gtoTasks) {
    const existing = await prisma.gtoTask.findFirst({ where: { title: t.title } });
    if (!existing) {
      await prisma.gtoTask.create({ data: { ...t, isPublished: true } });
    }
  }
  console.log('Seeded GTO & MPE tasks.');

  // 7. Seed Board Interview Questions
  const interviewQuestions = [
    {
      category: 'PIQ',
      questionText: 'Why do you wish to join the Bangladesh Armed Forces as an officer rather than pursuing a lucrative corporate job?',
      guidelines: 'Speak from authentic passion, patriotism, structured discipline, desire to lead troops under fire, and honor. Avoid cliché textbook responses.',
      counterQuestions: JSON.stringify(['If you are not selected this time, what is your alternate career plan?', 'How do your parents feel about the danger involved in combat?'])
    },
    {
      category: 'PIQ',
      questionText: 'What is your greatest personal weakness, and what concrete measures have you implemented to overcome it?',
      guidelines: 'Demonstrate genuine self-awareness and active improvement. E.g. "I previously struggled with public speaking anxiety, so I joined the college debate club and took on stage emceeing."',
      counterQuestions: JSON.stringify(['Give an example where this weakness affected your academic or team performance.'])
    },
    {
      category: 'DEFENSE_GK',
      questionText: 'What are the main combat aircraft and naval submarines in Bangladesh Armed Forces inventory, and what is the tri-service motto?',
      guidelines: 'Air Force: MiG-29, F-7 BGI. Navy: Type 035G Ming-class submarines (BNS Nabajatra, BNS Joyjatra), stealth frigates. Army: "Somor-e Amra Shanti-te Amra, Sob-e Amra Protishruto".',
      counterQuestions: JSON.stringify(['What is the role of Forces Goal 2030 in modernizing national defense?'])
    },
    {
      category: 'GEOPOLITICS',
      questionText: 'What is the strategic significance of the Bay of Bengal for Bangladesh national security and economic growth?',
      guidelines: 'Discuss Sea Lines of Communication (SLOC), Blue Economy offshore resources, Matarbari deep seaport, maritime boundary demarcation with India and Myanmar, and naval deterrence.',
      counterQuestions: JSON.stringify(['How does the Malacca Strait congestion impact Bay of Bengal shipping?'])
    },
    {
      category: 'PSYCH_STRESS',
      questionText: 'If your commanding officer gives you an order that directly violates your moral convictions during an active peacekeeping mission, how do you respond?',
      guidelines: 'Military orders must be lawful. Distinguish between personal hesitation vs unlawful orders under Geneva Conventions / Rules of Engagement. Communicate tactfully and seek clarification through official command channels.',
      counterQuestions: JSON.stringify(['What if there is no time to consult higher headquarters and lives are on the line?'])
    }
  ];

  for (const q of interviewQuestions) {
    const existing = await prisma.interviewQuestion.findFirst({ where: { questionText: q.questionText } });
    if (!existing) {
      await prisma.interviewQuestion.create({ data: { ...q, isPublished: true } });
    }
  }
  console.log('Seeded Interview questions.');

  // 8. Seed 9 Official ISSB Physical Obstacles
  const physicalObstacles = [
    {
      obstacleNumber: 1,
      name: 'Long Jump (9-Foot Ditch)',
      marks: 5,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Sprint with measured acceleration. Take off firmly from the white board before the red foul line. Land on both feet flexing knees to absorb impact.',
      commonMistakes: 'Stepping on or over the red boundary line (counts as foul). Stuttering stride right before take-off.',
      orderStrategy: 'Clear this early when legs are fresh and explosive power is peak.'
    },
    {
      obstacleNumber: 2,
      name: 'Zig-Zag Balance Beam',
      marks: 5,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Keep arms outstretched for balance. Look 6 feet ahead, not straight down at your boots. Run with light, rhythmic steps.',
      commonMistakes: 'Stopping in the middle or swinging arms erratically. Slipping off sides.',
      orderStrategy: 'Fast, smooth transition obstacle. Do not hesitate at angles.'
    },
    {
      obstacleNumber: 3,
      name: 'High Screen (6-Foot Wooden Wall)',
      marks: 5,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Approach with momentum. Plant one foot high on the wooden wall face to kick upward. Grip top ridge with both palms and roll your torso over.',
      commonMistakes: 'Jumping purely upwards with zero forward drive. Belly-flopping on the top ridge.',
      orderStrategy: 'Requires upper body pull and abdominal coordination.'
    },
    {
      obstacleNumber: 4,
      name: 'Tarzan Swing',
      marks: 6,
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Climb the 10-foot platform. Grasp the hanging rope as high as possible. Swing forward with knees bent and release precisely past the red boundary line.',
      commonMistakes: 'Releasing too early or swinging backward into the ditch.',
      orderStrategy: 'Commit fully to the forward swing momentum.'
    },
    {
      obstacleNumber: 5,
      name: 'Commando Walk (Elevated Planks)',
      marks: 6,
      imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Walk swiftly across 12-foot high wooden planks suspended between pillars. Maintain composure and focus straight ahead.',
      commonMistakes: 'Freezing due to fear of height. Crouching or crawling when walking is mandated.',
      orderStrategy: 'Demonstrates psychological composure at elevation.'
    },
    {
      obstacleNumber: 6,
      name: 'Tiger Leap (Platform to Rope Jump)',
      marks: 6,
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Stand on the 9-foot high springboard. Jump outward toward the suspended rope. Clamp rope between thighs and palms, then slide down safely.',
      commonMistakes: 'Jumping downwards instead of outward. Missing rope grip.',
      orderStrategy: 'High adrenaline obstacle testing raw courage.'
    },
    {
      obstacleNumber: 7,
      name: 'Monkey Crawl (Single Steel Cable)',
      marks: 7,
      imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Hang inverted beneath the suspended steel cable. Hook ankles and pull hand-over-hand with core braced.',
      commonMistakes: 'Letting legs hang loose, causing violent body swing and fatigue.',
      orderStrategy: 'Clear before rope climbing to avoid total grip burnout.'
    },
    {
      obstacleNumber: 8,
      name: 'Burma Bridge (Two-Cable Traverse)',
      marks: 7,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Step sideways on the lower foot-cable while holding both hand-cables shoulder-width apart. Slide feet smoothly.',
      commonMistakes: 'Crossing legs while stepping, losing equilibrium.',
      orderStrategy: 'Smooth, steady pacing gets you across in under 20 seconds.'
    },
    {
      obstacleNumber: 9,
      name: 'Rope Climbing (15-Foot Vertical Rope)',
      marks: 8,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      techniqueGuide: 'Use the J-Hook or S-Wrap foot lock technique to clamp the rope. Stand up using leg drive rather than pulling purely with biceps. Touch the bell at the top.',
      commonMistakes: 'Pulling with arms alone without engaging foot clamp, leading to rapid exhaustion.',
      orderStrategy: 'Highest mark obstacle (8 marks). Essential to complete for full clearance.'
    }
  ];

  for (const obs of physicalObstacles) {
    await prisma.physicalObstacle.upsert({
      where: { obstacleNumber: obs.obstacleNumber },
      update: obs,
      create: obs
    });
  }
  console.log('Seeded 9 Physical Obstacles.');

  console.log('ALL MODULE SEEDING COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
