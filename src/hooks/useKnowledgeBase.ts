
import { useState, useEffect } from 'react';

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  url: string;
  category: string;
}

export const useKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // RMIT information extracted from the provided links
  const rmitKnowledgeBase: KnowledgeBaseItem[] = [
    {
      id: '1',
      title: 'Study with RMIT',
      content: `RMIT University offers a wide range of study options including undergraduate degrees, postgraduate programs, vocational education, and research opportunities. We provide practical, industry-relevant education designed to prepare students for successful careers.`,
      url: 'https://www.rmit.edu.au/study-with-us',
      category: 'study-options'
    },
    {
      id: '2',
      title: 'Undergraduate Programs',
      content: `RMIT offers bachelor degrees across various disciplines including business, engineering, design, technology, health sciences, and more. Our undergraduate programs combine theoretical knowledge with practical experience through industry partnerships.`,
      url: 'https://www.rmit.edu.au/study-with-us',
      category: 'undergraduate'
    },
    {
      id: '3',
      title: 'Postgraduate Programs',
      content: `Master's degrees and graduate certificates available across multiple fields. These programs are designed for career advancement and specialization, often featuring flexible study options for working professionals.`,
      url: 'https://www.rmit.edu.au/study-with-us',
      category: 'postgraduate'
    },
    {
      id: '4',
      title: 'RMIT University Overview',
      content: `RMIT is a global university of technology, design and enterprise. We're committed to helping shape the world through research, innovation and engagement, and to creating transformative experiences for students to prepare them for life and work.`,
      url: 'https://www.rmit.edu.au/',
      category: 'about'
    },
    {
      id: '5',
      title: 'Campus Locations',
      content: `RMIT has campuses in Melbourne, Australia, and international locations in Vietnam and Spain. Our Melbourne campus is located in the heart of the city, providing students with access to industry, culture, and employment opportunities.`,
      url: 'https://www.rmit.edu.au/',
      category: 'campus'
    },
    {
      id: '6',
      title: 'Industry Connections',
      content: `RMIT maintains strong partnerships with industry leaders, providing students with real-world experience through internships, work placements, and industry projects. This ensures graduates are job-ready upon completion of their studies.`,
      url: 'https://www.rmit.edu.au/',
      category: 'industry'
    },
    {
      id: '7',
      title: 'Research and Innovation',
      content: `RMIT is renowned for applied research that makes a difference. Our research focuses on solving real-world problems in areas such as health and biomedical sciences, advanced manufacturing, and sustainable futures.`,
      url: 'https://www.rmit.edu.au/',
      category: 'research'
    },
    {
      id: '8',
      title: 'Student Support Services',
      content: `RMIT provides comprehensive support services including academic support, career guidance, mental health services, and international student support to ensure student success throughout their studies.`,
      url: 'https://www.rmit.edu.au/',
      category: 'support'
    }
  ];

  useEffect(() => {
    setKnowledgeBase(rmitKnowledgeBase);
  }, []);

  const searchKnowledge = (query: string): string => {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    if (queryWords.length === 0) {
      return "";
    }

    const scoredItems = knowledgeBase.map(item => {
      let score = 0;
      queryWords.forEach(word => {
        if (item.title.toLowerCase().includes(word)) score += 5;
        if (item.content.toLowerCase().includes(word)) score += 1;
        if (item.category.toLowerCase().includes(word)) score += 3;
      });
      return { ...item, score };
    }).filter(item => item.score > 0);

    scoredItems.sort((a, b) => b.score - a.score);

    const relevantItems = scoredItems.slice(0, 3);

    if (relevantItems.length === 0) {
      return "";
    }

    return relevantItems.map(item => `${item.title}: ${item.content}`).join('\n\n');
  };

  return {
    knowledgeBase,
    searchKnowledge,
    isLoading
  };
};
