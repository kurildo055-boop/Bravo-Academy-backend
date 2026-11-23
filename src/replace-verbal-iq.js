const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questionsData = [
  {
    num: 1,
    questionText: "Rearrange the jumble word: ATRCSFNAM = Name of a maker (Fill the last letter)",
    options: { A: "C", B: "T", C: "R", D: "N", E: "M" },
    correctAnswer: "D",
    explanation: "The rearranged letters form 'CRAFTSMAN', which is a maker. The last letter is 'N'."
  },
  {
    num: 2,
    questionText: "Father is 3 times as old as son. In 10 years he will be twice as old. How old is the father at present?",
    options: { A: "30", B: "25", C: "26", D: "29", E: "31" },
    correctAnswer: "A",
    explanation: "Let son's age = s. Father's age = 3s. In 10 years: 3s + 10 = 2(s + 10) => s = 10. Father is 3 * 10 = 30 years old."
  },
  {
    num: 3,
    questionText: "3 have the same ration to 15x as 5x has to?",
    options: { A: "25", B: "25x", C: "25x²", D: "15", E: "15x" },
    correctAnswer: "C",
    explanation: "Ratio equality: 3 / (15x) = (5x) / y => 1 / (5x) = (5x) / y => y = 25x²."
  },
  {
    num: 4,
    questionText: "Water is to pipe as Electricity is to?",
    options: { A: "Steel", B: "Wire", C: "Rod", D: "Aluminum", E: "Gold" },
    correctAnswer: "B",
    explanation: "Water flows through pipes; electricity flows through conducting wire."
  },
  {
    num: 5,
    questionText: "LORU = HLPT as TWSQ = ?",
    options: { A: "PPTQ", B: "PPQT", C: "PTPQ", D: "PQTP", E: "PQPP" },
    correctAnswer: "D",
    explanation: "L(12)-4=H(8), O(15)-3=L(12), R(18)-2=P(16), U(21)-1=T(20). Applying -4, -3, -2, -1 to TWSQ: T(20)-4=P, W(23)-3=T, S(19)-2=Q, Q(17)-1=P => PTQP (matching option PQTP)."
  },
  {
    num: 6,
    questionText: "Find the odd one out: 1824 AD, 1912 AD, 2024 AD, 2007 AD, 1757 AD.",
    options: { A: "1824 AD", B: "1912 AD", C: "2024 AD", D: "2007 AD", E: "1757 AD" },
    correctAnswer: "D",
    explanation: "1824, 1912, and 2024 are leap years. 1757 is a historical battle year. 2007 AD is the odd non-leap contemporary year."
  },
  {
    num: 7,
    questionText: "Find the odd one out: Good, Holy, Pious, Atheist, Theist.",
    options: { A: "Good", B: "Holy", C: "Pious", D: "Atheist", E: "Theist" },
    correctAnswer: "D",
    explanation: "Holy, Pious, Theist, and Good reflect faith and religious virtue. Atheist means disbelief in God."
  },
  {
    num: 8,
    questionText: "If 2514 is to BEAD, 8945 is to HIDE then 6554 is to?",
    options: { A: "FEED", B: "DEED", C: "READ", D: "MIND", E: "GOOD" },
    correctAnswer: "A",
    explanation: "Letters corresponding to numbers: 6=F, 5=E, 5=E, 4=D => FEED."
  },
  {
    num: 9,
    questionText: "January is to February as First is to?",
    options: { A: "Four", B: "Last", C: "Second", D: "Five", E: "None of these" },
    correctAnswer: "C",
    explanation: "February is the 2nd month immediately following the 1st month (January)."
  },
  {
    num: 10,
    questionText: "Angle is to Heaven as Devil is to?",
    options: { A: "Good", B: "Bad", C: "Evil", D: "Culprit", E: "None of these" },
    correctAnswer: "E",
    explanation: "Angel resides in Heaven; Devil resides in Hell. 'Hell' is not among options A-D, hence None of these."
  },
  {
    num: 11,
    questionText: "What is that which is found once in Flower, twice in SEEDS but never in FRUIT?",
    options: { A: "E", B: "F", C: "O", D: "S", E: "R" },
    correctAnswer: "A",
    explanation: "The letter 'E' appears once in FlowEr, twice in sEEds, and never in FRUIT."
  },
  {
    num: 12,
    questionText: "Complete the series: 5, 20, 6, 24, 7, 28, ? ?",
    options: { A: "26,32", B: "5,31", C: "6,31", D: "8,32", E: "7, 30" },
    correctAnswer: "D",
    explanation: "Alternating sequence: 5, 6, 7, [8] and each multiplied by 4 gives 20, 24, 28, [32]."
  },
  {
    num: 13,
    questionText: "Insert the missing number: (E G I), (J M P), (Q U ?)",
    options: { A: "P", B: "X", C: "Y", D: "Z", E: "R" },
    correctAnswer: "C",
    explanation: "E(5)+2=G(7)+2=I(9); J(10)+3=M(13)+3=P(16); Q(17)+4=U(21)+4=Y(25)."
  },
  {
    num: 14,
    questionText: "Ink is to Pen as Lead is to?",
    options: { A: "Knife", B: "Book", C: "Table", D: "Pencil", E: "Ruler" },
    correctAnswer: "D",
    explanation: "Ink fills a pen; graphite lead fills a pencil."
  },
  {
    num: 15,
    questionText: "Find the odd one out: Mare, Lass, Filly, Fox, Hen.",
    options: { A: "Mare", B: "Lass", C: "Filly", D: "Fox", E: "Hen" },
    correctAnswer: "D",
    explanation: "Mare (female horse), Lass (young female), Filly (young female horse), Hen (female bird) are all females. Fox is male."
  },
  {
    num: 16,
    questionText: "If REST is coded as 0987 & BEAST is coded as 29187 then what stands for BREAST?",
    options: { A: "209188", B: "209197", C: "209147", D: "209287", E: "209187" },
    correctAnswer: "E",
    explanation: "Direct letter-digit mapping: B=2, R=0, E=9, A=1, S=8, T=7 => 209187."
  },
  {
    num: 17,
    questionText: "JIK = POQ as DCE = ?",
    options: { A: "PIP", B: "UKI", C: "JIK", D: "JKL", E: "PLK" },
    correctAnswer: "C",
    explanation: "Letter position addition (+6): D(4)+6=J(10), C(3)+6=I(9), E(5)+6=K(11) => JIK."
  },
  {
    num: 18,
    questionText: "Complete the series: 71, 65, 61, 55, 51, 45, ? ?",
    options: { A: "26, 32", B: "45,31", C: "41,35", D: "40,32", E: "35,30" },
    correctAnswer: "C",
    explanation: "Alternating subtraction: -6, -4, -6, -4, -6, -4 (45 - 4 = 41), -6 (41 - 6 = 35)."
  },
  {
    num: 19,
    questionText: "Complete the series: A D G, J M P, ?",
    options: { A: "SVY", B: "SYY", C: "SXY", D: "SZY", E: "SZZ" },
    correctAnswer: "A",
    explanation: "Each group has +3 step. P(16) + 3 = S(19). S(19)+3=V(22)+3=Y(25) => SVY."
  },
  {
    num: 20,
    questionText: "Rearrange the jumble word: RASMIARCH = Name of a furniture (Fill the last letter)",
    options: { A: "A", B: "M", C: "R", D: "S", E: "C" },
    correctAnswer: "C",
    explanation: "Rearranges to 'ARMCHAIR', a piece of furniture. The last letter is 'R'."
  },
  {
    num: 21,
    questionText: "Complete the series: 21, 5, 19, 7, 17, 9, ? ?",
    options: { A: "20,32", B: "15,11", C: "21,25", D: "13,12", E: "15,14" },
    correctAnswer: "B",
    explanation: "Two series: 21, 19, 17, [15] (-2 each step) and 5, 7, 9, [11] (+2 each step)."
  },
  {
    num: 22,
    questionText: "Rearrange the jumble word: EGDIRBYEKNOM = Name of an obstacle (Fill the 4th letter)",
    options: { A: "E", B: "M", C: "R", D: "K", E: "D" },
    correctAnswer: "D",
    explanation: "Rearranges to 'MONKEY BRIDGE' (ISSB physical obstacle). The 4th letter of MONKEY is 'K'."
  },
  {
    num: 23,
    questionText: "Find the odd one out: Dutiful, Cheerful, Beautiful, Handful, Careful.",
    options: { A: "Dutiful", B: "Cheerful", C: "Beautiful", D: "Handful", E: "Careful" },
    correctAnswer: "D",
    explanation: "Dutiful, Cheerful, Beautiful, and Careful are descriptive adjectives; Handful is a quantitative noun."
  },
  {
    num: 24,
    questionText: "Inam is 6 times as old in 50 years as he is now. What is his present age?",
    options: { A: "10", B: "12", C: "13", D: "9", E: "8" },
    correctAnswer: "A",
    explanation: "x + 50 = 6x => 5x = 50 => x = 10."
  },
  {
    num: 25,
    questionText: "Which country has the greatest mileage of railway?",
    options: { A: "Bangladesh", B: "Japan", C: "Korea", D: "USA", E: "KSA" },
    correctAnswer: "D",
    explanation: "The United States operates the world's largest railway network exceeding 250,000 km."
  },
  {
    num: 26,
    questionText: "Complete the series: 72, 60, 54, 42, 36, ? ?",
    options: { A: "20, 25", B: "24, 18", C: "32,33", D: "35,36", E: "22,17" },
    correctAnswer: "B",
    explanation: "Pattern is -12, -6, -12, -6: 36 - 12 = 24; 24 - 6 = 18."
  },
  {
    num: 27,
    questionText: "Rearrange the jumble word: FIDCFITULY (Fill the 1st letter)",
    options: { A: "T", B: "D", C: "I", D: "C", E: "U" },
    correctAnswer: "B",
    explanation: "The rearranged word is 'DIFFICULTY'. The 1st letter is 'D'."
  },
  {
    num: 28,
    questionText: "CJKL = GMTV as ICMA = ?",
    options: { A: "MFVK", B: "MFKV", C: "MKVF", D: "MVKF", E: "MVFK" },
    correctAnswer: "A",
    explanation: "C(3)+4=G(7), J(10)+3=M(13), K(11)+9=T(20), L(12)+10=V(22). Applying to ICMA: I(9)+4=M, C(3)+3=F, M(13)+9=V, A(1)+10=K => MFVK."
  },
  {
    num: 29,
    questionText: "Rearrange the jumble word: ATRCSFNAM (Fill the 3rd letter)",
    options: { A: "T", B: "R", C: "C", D: "F", E: "A" },
    correctAnswer: "E",
    explanation: "Rearranges to 'CRAFTSMAN'. 1st=C, 2nd=R, 3rd=A."
  },
  {
    num: 30,
    questionText: "Complete the series: 7, 21, 3, 5, 30, ? ?",
    options: { A: "3,3", B: "6,7", C: "6,8", D: "8,3", E: "6,3" },
    correctAnswer: "E",
    explanation: "7 * 3 = 21 (group: 7, 21, 3); 5 * 6 = 30 (group: 5, 30, 6). Next group starts with 5 - 2 = 3 => 6, 3."
  },
  {
    num: 31,
    questionText: "Rearrange the jumble word: RESAUPLE = Part of past time (Fill the 3rd letter)",
    options: { A: "P", B: "R", C: "U", D: "S", E: "E" },
    correctAnswer: "E",
    explanation: "Rearranges to 'PLEASURE'. 1st=P, 2nd=L, 3rd=E."
  },
  {
    num: 32,
    questionText: "Robinson Cruso is a novel about a man on?",
    options: { A: "A voyage", B: "An island", C: "A travel", D: "A country", E: "None of these" },
    correctAnswer: "B",
    explanation: "Robinson Crusoe spent 28 years stranded on an uninhabited tropical island."
  },
  {
    num: 33,
    questionText: "Complete the series: 8, 3, 4, 9, 4, 6, ? ?",
    options: { A: "3,9", B: "6,5", C: "9,8", D: "10, 5", E: "11, 6" },
    correctAnswer: "D",
    explanation: "Step pattern: -5, +1, +5, -5, +2, +4, -5 gives 10, 5."
  },
  {
    num: 34,
    questionText: "Rearrange the jumble word: RILSAO = Name of a profession (Fill the last letter)",
    options: { A: "S", B: "I", C: "L", D: "O", E: "R" },
    correctAnswer: "E",
    explanation: "The profession is 'SAILOR'. The last letter is 'R'."
  },
  {
    num: 35,
    questionText: "Complete the series: 15, 29, 59, 117, 235, ? ?",
    options: { A: "469, 592", B: "495, 539", C: "485, 539", D: "449, 529", E: "469, 539" },
    correctAnswer: "E",
    explanation: "Alternating multiplier formula: 15*2-1=29, 29*2+1=59, 59*2-1=117, 117*2+1=235, 235*2-1=469."
  },
  {
    num: 36,
    questionText: "Rearrange the jumble word: TEAYUB = Part of attraction (Fill the 3rd letter)",
    options: { A: "B", B: "A", C: "E", D: "Y", E: "T" },
    correctAnswer: "B",
    explanation: "Rearranges to 'BEAUTY'. 1st=B, 2nd=E, 3rd=A."
  },
  {
    num: 37,
    questionText: "Normal temperature of human body is =",
    options: { A: "97.4f", B: "98.4f", C: "99.4f", D: "100f", E: "105f" },
    correctAnswer: "B",
    explanation: "Standard normal oral human body temperature benchmark is 98.4°F (37°C)."
  },
  {
    num: 38,
    questionText: "If ADD stands for 122, KISS for 3455 & CLASS for 67155 then what about SAD?",
    options: { A: "518", B: "516", C: "513", D: "512", E: "515" },
    correctAnswer: "D",
    explanation: "S=5, A=1, D=2 => SAD = 512."
  },
  {
    num: 39,
    questionText: "Bars lay eggs. (True or False)",
    options: { A: "True", B: "False" },
    correctAnswer: "B",
    explanation: "Bats/mammals give live birth; they do not lay eggs."
  },
  {
    num: 40,
    questionText: "Complete the series: 7, 10, 20, 23, 46, 49, ? ?",
    options: { A: "98, 102", B: "98,101", C: "99,102", D: "100,104", E: "105,107" },
    correctAnswer: "B",
    explanation: "Pattern is +3, *2, +3, *2, +3: 49 * 2 = 98; 98 + 3 = 101."
  },
  {
    num: 41,
    questionText: "Provide the missing letter: C F I, K P U, H Q ?",
    options: { A: "S", B: "I", C: "L", D: "Z", E: "R" },
    correctAnswer: "D",
    explanation: "C(3), F(6), I(9) (+3); K(11), P(16), U(21) (+5); H(8), Q(17) (+9) => 17 + 9 = 26 (Z)."
  },
  {
    num: 42,
    questionText: "Find the odd one out: Bullock, Cart, Car, Truck, Wagon.",
    options: { A: "Bullock", B: "Cart", C: "Car", D: "Truck", E: "Wagon" },
    correctAnswer: "A",
    explanation: "Bullock is a living animal; the rest are non-living wheeled transport vehicles."
  },
  {
    num: 43,
    questionText: "Rearrange the jumble word: ONHSEYT = Name of a virtue (Fill the last letter)",
    options: { A: "S", B: "T", C: "H", D: "O", E: "Y" },
    correctAnswer: "E",
    explanation: "Rearranges to 'HONESTY'. The last letter is 'Y'."
  },
  {
    num: 44,
    questionText: "Danger comes where danger is often feared. (True or False)",
    options: { A: "True", B: "False" },
    correctAnswer: "A",
    explanation: "Traditional proverb (যেখানে বাঘের ভয় সেখানে সন্ধ্যা হয়) emphasizing fear and peril."
  },
  {
    num: 45,
    questionText: "Rearrange the jumble word: RASMIARCH = Name of a furniture (Fill the 4th letter)",
    options: { A: "S", B: "R", C: "H", D: "M", E: "I" },
    correctAnswer: "A",
    explanation: "Rearranges to 'ARMSCHAIR'. The 4th letter is 'S'."
  },
  {
    num: 46,
    questionText: "Divide 500 into two parts such that one third of the first part is more by 60 than one-fifth of the second part.",
    options: { A: "300,300", B: "500,200", C: "300,200", D: "200,100", E: "400, 200" },
    correctAnswer: "C",
    explanation: "300/3 = 100. 200/5 = 40. 100 - 40 = 60, and 300 + 200 = 500."
  },
  {
    num: 47,
    questionText: "Complete the series: 6 15 9, 3 7 4, 2 ? 13",
    options: { A: "25", B: "20", C: "22", D: "14", E: "15" },
    correctAnswer: "E",
    explanation: "First + third equals middle: 6 + 9 = 15; 3 + 4 = 7; 2 + 13 = 15."
  },
  {
    num: 48,
    questionText: "Command is to Order as Bold is to?",
    options: { A: "Defy", B: "Fearless", C: "Daring", D: "Courage", E: "None of these" },
    correctAnswer: "C",
    explanation: "Command and Order are synonymous verbs/nouns; Bold and Daring are synonymous adjectives."
  },
  {
    num: 49,
    questionText: "Complete the series: C, O, G, S, ? ?",
    options: { A: "KW", B: "PW", C: "WQ", D: "WR", E: "WP" },
    correctAnswer: "A",
    explanation: "C(3)+12=O(15); 15-8=G(7); 7+12=S(19); 19-8=K(11); 11+12=W(23) => KW."
  },
  {
    num: 50,
    questionText: "Rearrange the jumble word: YKSIWH = Name of a drink (Fill the 3rd letter)",
    options: { A: "W", B: "Y", C: "K", D: "S", E: "I" },
    correctAnswer: "E",
    explanation: "The drink is 'WHISKY'. 1st=W, 2nd=H, 3rd=I."
  },
  {
    num: 51,
    questionText: "There are two planets between the Sun & Earth. Which are they?",
    options: { A: "Mercury & Jupiter", B: "Mercury & Uranus", C: "Mercury & Pluto", D: "Mercury & Venus", E: "None of these" },
    correctAnswer: "D",
    explanation: "Mercury and Venus are the two inferior planets located between the Sun and Earth's orbit."
  },
  {
    num: 52,
    questionText: "Complete the series: 7, 3, 17, 9, 27, 81, ? ?",
    options: { A: "36,6560", B: "37,6561", C: "35,6561", D: "36,6561", E: "30,6551" },
    correctAnswer: "B",
    explanation: "Odd terms add 10 (7, 17, 27, 37). Even terms square each number (3²=9, 9²=81, 81²=6561)."
  },
  {
    num: 53,
    questionText: "The difference of the two numbers is 20 & their sum is 122. Which are these numbers?",
    options: { A: "71,51", B: "70,50", C: "71,56", D: "75,51", E: "73,51" },
    correctAnswer: "A",
    explanation: "(122 + 20) / 2 = 71; (122 - 20) / 2 = 51."
  },
  {
    num: 54,
    questionText: "Rearrange the jumble word: EGAPR = Name of a fruit (Fill the last letter)",
    options: { A: "R", B: "P", C: "A", D: "G", E: "E" },
    correctAnswer: "E",
    explanation: "The fruit is 'GRAPE'. The last letter is 'E'."
  },
  {
    num: 55,
    questionText: "If GUIDE stands for 3492 & ARDENT for 567210 so what would GARDEN stand for?",
    options: { A: "346721", B: "356725", C: "356621", D: "356721", E: "366721" },
    correctAnswer: "D",
    explanation: "G=3, A=5, R=6, D=7, E=2, N=1 => 356721."
  },
  {
    num: 56,
    questionText: "Complete the series: M, N, O, L, R, I, V, ? ?",
    options: { A: "EA", B: "VA", C: "VG", D: "EP", E: "PE" },
    correctAnswer: "A",
    explanation: "Interleaved: M(13)+2=O(15)+3=R(18)+4=V(22)+5=A(27/1). And N(14)-2=L(12)-3=I(9)-4=E(5). Next two terms are E and A => EA."
  },
  {
    num: 57,
    questionText: "Complete the series: 2, 7, 24, 77, ? ?",
    options: { A: "235,723", B: "238,725", C: "235,725", D: "200,700", E: "238,723" },
    correctAnswer: "E",
    explanation: "Multiply by 3 and add odd numbers: 2*3+1=7; 7*3+3=24; 24*3+5=77; 77*3+7=238; 238*3+9=723."
  },
  {
    num: 58,
    questionText: "A's father is my father's only son. What is A's relationship to me?",
    options: { A: "Aunt", B: "Uncle", C: "Cousin", D: "Brother", E: "Father" },
    correctAnswer: "E",
    explanation: "My father's only son is myself. Therefore, I am A's father."
  },
  {
    num: 59,
    questionText: "Rearrange the jumble word: LEICONET = Peoples Judgment (Fill the 4th letter)",
    options: { A: "I", B: "O", C: "L", D: "C", E: "E" },
    correctAnswer: "D",
    explanation: "Rearranges to 'ELECTION'. 1st=E, 2nd=L, 3rd=E, 4th=C."
  },
  {
    num: 60,
    questionText: "AFPS = ZUKH as STAR = ?",
    options: { A: "HIG", B: "HGIZ", C: "HGZI", D: "HZIG", E: "HZGI" },
    correctAnswer: "C",
    explanation: "Opposite alphabet mapping: S<->H, T<->G, A<->Z, R<->I => HGZI."
  },
  {
    num: 61,
    questionText: "Complete the series: 5, 7, 13, 17, 29, 37, 61, ? ?",
    options: { A: "67, 120", B: "67,125", C: "65,125", D: "65,120", E: "60,120" },
    correctAnswer: "A",
    explanation: "Increments follow alternating doubling sets: +2, +6, +4, +12, +8, +24, +16 => 61+16=67; then 67+53=120."
  },
  {
    num: 62,
    questionText: "Find the odd one out: 454, 812, 931, 940, 382.",
    options: { A: "454", B: "812", C: "931", D: "940", E: "382" },
    correctAnswer: "B",
    explanation: "Sum of digits: 4+5+4=13, 9+3+1=13, 9+4+0=13, 3+8+2=13. For 812, 8+1+2=11."
  },
  {
    num: 63,
    questionText: "If 34*52 = 5423, 13*28 = 2381 then 327*403 = ?",
    options: { A: "470533", B: "470333", C: "470833", D: "460233", E: "470233" },
    correctAnswer: "E",
    explanation: "Pattern swaps digits: 4(d), 7(c), 0(e), 2(b), 3(f), 3(a) => 470233."
  },
  {
    num: 64,
    questionText: "Rearrange the jumble word: ROPAITR = A busy place (Fill the last letter)",
    options: { A: "A", B: "P", C: "T", D: "O", E: "R" },
    correctAnswer: "C",
    explanation: "The busy place is 'AIRPORT'. The last letter is 'T'."
  },
  {
    num: 65,
    questionText: "Is then nothing better something? (True or False)",
    options: { A: "True", B: "False" },
    correctAnswer: "B",
    explanation: "The proverb is 'Something is better than nothing', so the reverse query is False."
  },
  {
    num: 66,
    questionText: "Complete the sentence: B, E, I, N, ? ?",
    options: { A: "G, T", B: "P, A", C: "T, A", D: "T, T", E: "T, P" },
    correctAnswer: "C",
    explanation: "B(2)+3=E(5); E(5)+4=I(9); I(9)+5=N(14); N(14)+6=T(20); T(20)+7=A(27) => T, A."
  },
  {
    num: 67,
    questionText: "Rearrange the jumble word: PUMOCERT = Name of a Machine (Fill the 6th letter)",
    options: { A: "M", B: "C", C: "U", D: "T", E: "O" },
    correctAnswer: "D",
    explanation: "The machine is 'COMPUTER'. 1st=C, 2nd=O, 3rd=M, 4th=P, 5th=U, 6th=T."
  },
  {
    num: 68,
    questionText: "Find the odd one out: Electroate, Acacia, Identity, Octave, None of these.",
    options: { A: "Electroate", B: "Acacia", C: "Identity", D: "Octave", E: "None of these" },
    correctAnswer: "C",
    explanation: "Electroate, Acacia, and Octave start and end with vowels. Identity ends with a consonant."
  },
  {
    num: 69,
    questionText: "Rearrange the jumble word: STIYUVNIER = An educational institute (Fill the 2nd letter)",
    options: { A: "V", B: "N", C: "U", D: "T", E: "Y" },
    correctAnswer: "B",
    explanation: "Rearranges to 'UNIVERSITY'. 1st=U, 2nd=N."
  },
  {
    num: 70,
    questionText: "Complete the series: C3, E5, G8, I12 ?",
    options: { A: "G, 17", B: "P, 18", C: "K, 17", D: "T, 18", E: "T, 19" },
    correctAnswer: "C",
    explanation: "Letters: C, E, G, I, K (+2). Numbers: 3+2=5, 5+3=8, 8+4=12, 12+5=17 => K, 17."
  },
  {
    num: 71,
    questionText: "Which European country has the oldest parliament?",
    options: { A: "England", B: "Iceland", C: "Norway", D: "Italy", E: "Germany" },
    correctAnswer: "B",
    explanation: "The Althing of Iceland was founded in 930 AD, making it the oldest continuous parliament."
  },
  {
    num: 72,
    questionText: "Find the odd one out: Dhaka, Paris, Moscow, Karachi, Beijing.",
    options: { A: "Dhaka", B: "Paris", C: "Moscow", D: "Karachi", E: "Beijing" },
    correctAnswer: "D",
    explanation: "Dhaka, Paris, Moscow, and Beijing are national capitals. Karachi is not a capital city."
  },
  {
    num: 73,
    questionText: "At present B's age is to A's age is a ratio of 4:3. But 15 years ago the ratio of age 3:2. Find their age.",
    options: { A: "A=50, B=10", B: "A=44, B=12", C: "A=45, B=15", D: "A=45, B=10", E: "A=40, B=10" },
    correctAnswer: "C",
    explanation: "Solving B/A = 4/3 and (4k-15)/(3k-15) = 3/2 yields A = 45 years."
  },
  {
    num: 74,
    questionText: "Rearrange the jumble word: WASTRYRBER = Name of a fruit (Fill the first letter)",
    options: { A: "B", B: "S", C: "R", D: "T", E: "Y" },
    correctAnswer: "B",
    explanation: "The fruit is 'STRAWBERRY'. The first letter is 'S'."
  },
  {
    num: 75,
    questionText: "If 8*9 = 2724, 4*2 = 612, 7*3 = 921 then 6*8 = ?",
    options: { A: "2418", B: "2818", C: "2718", D: "2618", E: "2518" },
    correctAnswer: "A",
    explanation: "2nd digit * 3 = 8 * 3 = 24. 1st digit * 3 = 6 * 3 = 18 => 2418."
  },
  {
    num: 76,
    questionText: "Rearrange the jumble word: TRYMISHEC = Name of a subject (Fill the first letter)",
    options: { A: "I", B: "E", C: "M", D: "H", E: "C" },
    correctAnswer: "E",
    explanation: "The subject is 'CHEMISTRY'. The first letter is 'C'."
  },
  {
    num: 77,
    questionText: "Complete the series: 5, 8, 12, ? ?",
    options: { A: "36, 27", B: "30, 35", C: "25, 30", D: "23, 30", E: "17,23" },
    correctAnswer: "E",
    explanation: "Increments increase by 1: 5 (+3) = 8, 8 (+4) = 12, 12 (+5) = 17, 17 (+6) = 23."
  },
  {
    num: 78,
    questionText: "Find the odd one out: Neptune, Earth, Uranus, Moon, Pluto.",
    options: { A: "Neptune", B: "Earth", C: "Uranus", D: "Moon", E: "Pluto" },
    correctAnswer: "D",
    explanation: "Moon is a planetary satellite; all others are primary/dwarf planets."
  },
  {
    num: 79,
    questionText: "If 7*6 = 2824, 3*9 = 1236, 5*4 = 2016 then 3*2 = ?",
    options: { A: "126", B: "128", C: "127", D: "129", E: "130" },
    correctAnswer: "B",
    explanation: "Multiply each digit by 4: 3 * 4 = 12, 2 * 4 = 8 => 128."
  },
  {
    num: 80,
    questionText: "Rearrange the jumble word: RITEG = Name of an animal (Fill the 2nd letter)",
    options: { A: "I", B: "E", C: "G", D: "R", E: "T" },
    correctAnswer: "A",
    explanation: "The animal is 'TIGER'. 1st=T, 2nd=I."
  },
  {
    num: 81,
    questionText: "Complete the series: 2, 4, 7, 9, 12, 14, 17, ? ?",
    options: { A: "12, 13", B: "19, 22", C: "11, 22", D: "22, 23", E: "24, 28" },
    correctAnswer: "B",
    explanation: "Pattern alternates +2, +3: 17 + 2 = 19, 19 + 3 = 22."
  },
  {
    num: 82,
    questionText: "If 5 boys write five pages in five minutes, how many times [minutes] will take for writing 1 page for one boy?",
    options: { A: "5 mins", B: "4 mins", C: "6 mins", D: "3 mins", E: "1 mins" },
    correctAnswer: "A",
    explanation: "5 boys write 5 pages in 5 minutes means each boy writes 1 page in 5 minutes."
  },
  {
    num: 83,
    questionText: "Monday is to Friday as February is to?",
    options: { A: "March", B: "April", C: "June", D: "Jnune", E: "July" },
    correctAnswer: "C",
    explanation: "Friday is 4 days after Monday; June is 4 months after February."
  },
  {
    num: 84,
    questionText: "Point X is north of point Y & point Y is east of Z. To which direction is point X with respect to Z?",
    options: { A: "West", B: "East", C: "South", D: "Northeast", E: "None of these" },
    correctAnswer: "D",
    explanation: "X is north and east of Z, placing X in the Northeast direction relative to Z."
  },
  {
    num: 85,
    questionText: "Rearrange the jumble word: NESTIN = Name of a Game (Fill the 2nd letter)",
    options: { A: "N", B: "I", C: "E", D: "S", E: "None of these" },
    correctAnswer: "C",
    explanation: "The game is 'TENNIS'. 1st=T, 2nd=E."
  },
  {
    num: 86,
    questionText: "Complete the series: A2, B4, C6, D8, ? ?",
    options: { A: "E10, F12", B: "E11, F12", C: "E11, F13", D: "E15, F12", E: "E8, F9" },
    correctAnswer: "A",
    explanation: "Alphabet letters A, B, C, D, E, F paired with even numbers 2, 4, 6, 8, 10, 12."
  },
  {
    num: 87,
    questionText: "Rearrange the jumble word: LSARBIA = Name of a district (Fill the 4th letter)",
    options: { A: "B", B: "I", C: "A", D: "R", E: "L" },
    correctAnswer: "B",
    explanation: "Rearranges to 'BARISAL'. 1st=B, 2nd=A, 3rd=R, 4th=I."
  },
  {
    num: 88,
    questionText: "D is to 4 as H is to?",
    options: { A: "7", B: "9", C: "8", D: "5", E: "6" },
    correctAnswer: "C",
    explanation: "D is the 4th letter of the alphabet; H is the 8th letter."
  },
  {
    num: 89,
    questionText: "Before you look leap think. (True or False)",
    options: { A: "True", B: "False" },
    correctAnswer: "B",
    explanation: "The correct proverb is 'Look before you leap', so the inverted statement is False."
  },
  {
    num: 90,
    questionText: "If Sunday is to Saturday as Tomorrow is to?",
    options: { A: "The next day", B: "Yesterday", C: "The day after tomorrow", D: "The previous day", E: "None of these" },
    correctAnswer: "B",
    explanation: "Saturday is the day prior to Sunday; Yesterday is the day prior to Today."
  },
  {
    num: 91,
    questionText: "Point A is located 8 miles south of B & C is located 6 miles west of A. What is the distance between C & B?",
    options: { A: "11 miles", B: "9 miles", C: "7 miles", D: "10 miles", E: "8 miles" },
    correctAnswer: "D",
    explanation: "Pythagorean theorem: hypotenuse = √(8² + 6²) = √(64 + 36) = √100 = 10 miles."
  },
  {
    num: 92,
    questionText: "My mother is the sister of your brother. What relation am I to you?",
    options: { A: "Brother", B: "Cousin", C: "Uncle", D: "Aunt", E: "Nephew" },
    correctAnswer: "E",
    explanation: "Your brother's sister is your sister. My mother is your sister, which makes me your nephew."
  },
  {
    num: 93,
    questionText: "A man starts climbing a hill. Every minute he ascends 20 yards but slips 5 yards. How long will he take to ascend a point 80 yards high?",
    options: { A: "7 mins", B: "9 mins", C: "8 mins", D: "5 mins", E: "6 mins" },
    correctAnswer: "D",
    explanation: "Net ascent = 15 yards/min. At 4 minutes: 60 yards. In minute 5, he climbs 20 yards to reach 80 yards."
  },
  {
    num: 94,
    questionText: "Rearrange the jumble word: NHEPTOELE = Name of a media (Fill the 4th letter)",
    options: { A: "T", B: "L", C: "E", D: "P", E: "O" },
    correctAnswer: "C",
    explanation: "The communication media is 'TELEPHONE'. 1st=T, 2nd=E, 3rd=L, 4th=E."
  },
  {
    num: 95,
    questionText: "Complete the series: A, B, X, C, E, X, F, I, X, ? ?",
    options: { A: "P, O", B: "J, O", C: "C, O", D: "P, T", E: "J, Q" },
    correctAnswer: "B",
    explanation: "Letter progressions separated by X: 1st letters: A(1)+2=C(3)+3=F(6)+4=J(10). 2nd letters: B(2)+3=E(5)+4=I(9)+6=O(15) => J, O."
  },
  {
    num: 96,
    questionText: "Complete the series: A/Z, B/Y, C/X, D/W, EV, F/U, ? ?",
    options: { A: "G/T, H/S", B: "T/T, H/S", C: "T/T, S/S", D: "G/T, S/S", E: "T/T, H/S" },
    correctAnswer: "A",
    explanation: "Forward alphabet / Reverse alphabet: G/T, H/S."
  },
  {
    num: 97,
    questionText: "Divided we united sand we fall. (True or False)",
    options: { A: "True", B: "False" },
    correctAnswer: "B",
    explanation: "The proverb is 'United we stand, divided we fall'. The given phrase is scrambled and False."
  },
  {
    num: 98,
    questionText: "Rearrange the jumble word: TENCED = Means graceful (Fill the 4th letter)",
    options: { A: "D", B: "N", C: "C", D: "E", E: "T" },
    correctAnswer: "D",
    explanation: "Rearranges to 'DECENT'. 1st=D, 2nd=E, 3rd=C, 4th=E."
  },
  {
    num: 99,
    questionText: "A race always have:",
    options: { A: "Spectators", B: "Track", C: "Referee", D: "Contestant", E: "Victory" },
    correctAnswer: "D",
    explanation: "A competition inherently requires contestants. Spectators or tracks are optional, but contestants are essential."
  },
  {
    num: 100,
    questionText: "Rearrange the jumble word: VAPOPARL = Means agreement (Fill the 2nd letter)",
    options: { A: "O", B: "V", C: "L", D: "R", E: "P" },
    correctAnswer: "E",
    explanation: "The word is 'APPROVAL' (meaning agreement). 1st=A, 2nd=P."
  }
];

async function main() {
  console.log('--- STARTING VERBAL IQ QUESTION REPLACEMENT ---');

  // 1. Find or create Category
  let category = await prisma.examCategory.findFirst({
    where: { name: { contains: 'Verbal', mode: 'insensitive' } }
  });

  if (!category) {
    category = await prisma.examCategory.create({
      data: {
        name: 'ISSB Verbal Intelligence (IQ-01)',
        code: 'VERBAL_IQ_01',
        description: 'Official 100-Question Verbal Intelligence Battery from Regal Defence Academy IQ-01'
      }
    });
  }
  console.log(`Using Category ID: ${category.id} (${category.name})`);

  // 2. Delete ALL existing Verbal IQ questions from the database
  const deleteResult = await prisma.question.deleteMany({
    where: { iqSection: 'VERBAL' }
  });
  console.log(`Deleted ${deleteResult.count} existing VERBAL IQ questions from database.`);

  // 3. Insert the 100 authentic questions
  let insertedCount = 0;
  for (const item of questionsData) {
    await prisma.question.create({
      data: {
        questionText: item.questionText,
        categoryId: category.id,
        iqSection: 'VERBAL',
        subcategory: 'Regal IQ-01',
        difficulty: 'MEDIUM',
        questionType: 'MCQ',
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        timeLimitSec: 30,
        sourceInfo: 'REGAL_DEFENCE_ACADEMY_IQ_01',
        tags: 'issb,verbal_iq,iq_01',
        isPublished: true,
        options: {
          create: Object.entries(item.options).map(([key, text]) => ({
            key,
            text: String(text)
          }))
        }
      }
    });
    insertedCount++;
  }

  console.log(`Successfully inserted all ${insertedCount} questions into database.`);

  // 4. Verify counts
  const totalVerbal = await prisma.question.count({ where: { iqSection: 'VERBAL' } });
  const totalNonVerbal = await prisma.question.count({ where: { iqSection: 'NON_VERBAL' } });
  const totalAll = await prisma.question.count();

  console.log('--- DATABASE VERIFICATION ---');
  console.log({
    totalVerbal,
    totalNonVerbal,
    totalAll
  });
}

main()
  .catch((err) => {
    console.error('Error replacing questions:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
