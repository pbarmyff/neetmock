// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const generateQuestions = () => {
  const subjects = [
    { name: 'Physics', count: 45, topics: ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Modern Physics', 'Optics'] },
    { name: 'Chemistry', count: 45, topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
    { name: 'Biology', count: 90, topics: ['Genetics', 'Ecology', 'Human Physiology', 'Plant Physiology', 'Cell Biology'] }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const years = [2020, 2021, 2022, 2023];

  let questions = [];
  let currentId = 1;

  subjects.forEach(subject => {
    for (let i = 0; i < subject.count; i++) {
      const topic = subject.topics[i % subject.topics.length];
      const difficulty = difficulties[i % difficulties.length];
      const year = years[i % years.length];
      const correctOption = ['A', 'B', 'C', 'D'][i % 4];

      questions.push({
        id: currentId.toString(),
        subject: subject.name,
        topic: topic,
        subtopic: `${topic} Subtopic ${i % 3 + 1}`,
        question: `This is a sample ${difficulty} question for ${subject.name} in the topic of ${topic}. What is the correct answer?`,
        options: {
          A: `Option A for question ${currentId}`,
          B: `Option B for question ${currentId}`,
          C: `Option C for question ${currentId}`,
          D: `Option D for question ${currentId}`
        },
        correct: correctOption,
        explanation: `The correct answer is ${correctOption} because of the principles of ${topic}.`,
        difficulty: difficulty,
        year: year
      });
      currentId++;
    }
  });

  return questions;
};

const questions = generateQuestions();
const dirPath = path.join(__dirname, 'src', 'data');

if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFileSync(path.join(dirPath, 'questions.json'), JSON.stringify(questions, null, 2));

console.log(`Generated ${questions.length} questions in src/data/questions.json`);
