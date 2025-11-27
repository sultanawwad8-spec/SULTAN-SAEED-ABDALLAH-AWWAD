import { Question } from '../types';

export const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
};

export const downloadDocxLike = (script: string, questions: Question[] = [], includeAnswers: boolean = true) => {
  const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Listening Exam</title></head><body>` +
    `<h1>Listening Exam Script</h1><pre style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(script)}</pre>` +
    (questions.length > 0 ? renderQuestions(questions, includeAnswers) : '') +
    `</body></html>`;

  const blob = new Blob([htmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  triggerDownload(blob, 'listening-exam.docx');
};

const renderQuestions = (questions: Question[], includeAnswers: boolean) => {
  return `
    <h2>Comprehension Questions</h2>
    <ol>
      ${questions.map((q) => `
        <li>
          <p>${escapeHtml(q.text)}</p>
          <ol type="A">
            ${q.options.map((opt) => `<li>${escapeHtml(opt)}</li>`).join('')}
          </ol>
          ${includeAnswers ? `<p><strong>Answer:</strong> ${escapeHtml(q.correctAnswer)}</p>` : ''}
        </li>
      `).join('')}
    </ol>
  `;
};

const escapeHtml = (text: string) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
