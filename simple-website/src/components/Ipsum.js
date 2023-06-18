import React from 'react';
import { LoremIpsum } from "lorem-ipsum";

const LoremIpsumGenerator = ({ paragraphs }) => {
  const generateLoremIpsum = () => {
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 16,
        min: 4
      }
    });
    return lorem.generateParagraphs(paragraphs);
  };

  return <p>{generateLoremIpsum()}</p>;
};

export default LoremIpsumGenerator;
