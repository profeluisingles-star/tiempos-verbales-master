import { Question, ShuffledQuestion } from '../types';

/**
 * Modern Fisher-Yates shuffle algorithm that returns a new array with elements randomized
 */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepares questions with options guaranteed to be intercalated and properly shuffled.
 * Solves the critical issue where options were always 'A' in other apps.
 * In a list of questions, this also rotates or balances the position of the correct answer
 * across A (0), B (1), C (2), D (3) to prevent bias.
 */
export function prepareShuffledQuestions(questions: Question[]): ShuffledQuestion[] {
  // Balanced target indices for multiple choice [0, 1, 2, 3, 0, 1, 2, 3...]
  const targetSlots = [1, 2, 0, 3, 2, 1, 3, 0, 2, 0, 1, 3, 0, 2, 1, 3];

  return questions.map((q, idx) => {
    if (!q.options || q.options.length <= 1) {
      return {
        ...q,
        shuffledOptions: q.options,
        correctOptionIndex: 0,
      };
    }

    // Deduplicate options if any
    const uniqueOptions = Array.from(new Set(q.options));
    
    // Separate wrong options and correct answer
    const wrongOptions = uniqueOptions.filter(
      (opt) => opt.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase()
    );

    // Shuffle the wrong options
    const shuffledWrong = shuffleArray(wrongOptions);

    // Determine an intercalated position for the correct answer
    const preferredSlot = targetSlots[idx % targetSlots.length] % uniqueOptions.length;
    
    // Build the final options array with the correct answer inserted at the chosen slot
    const finalOptions: string[] = [];
    let wrongIdx = 0;

    for (let slot = 0; slot < uniqueOptions.length; slot++) {
      if (slot === preferredSlot) {
        finalOptions.push(q.correctAnswer);
      } else {
        if (wrongIdx < shuffledWrong.length) {
          finalOptions.push(shuffledWrong[wrongIdx]);
          wrongIdx++;
        } else {
          finalOptions.push(q.correctAnswer);
        }
      }
    }

    // Safety fallback: if correct answer wasn't included somehow
    if (!finalOptions.includes(q.correctAnswer)) {
      finalOptions[0] = q.correctAnswer;
    }

    const correctIndex = finalOptions.findIndex(
      (opt) => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
    );

    return {
      ...q,
      shuffledOptions: finalOptions,
      correctOptionIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  });
}

/**
 * Returns letter representation for an index: 0 -> A, 1 -> B, 2 -> C, 3 -> D
 */
export function getOptionLetter(index: number): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  return letters[index] || String(index + 1);
}
