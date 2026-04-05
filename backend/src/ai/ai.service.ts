import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CareerRecommendationDto } from './dto/career-recommendation.dto';
import { LearningPathDto } from './dto/learning-path.dto';

@Injectable()
export class AiService {
  // ✅ Updated to explicitly target Gemini 2.5 Flash for better stability
  private readonly geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private readonly apiKey = process.env.GEMINI_API_KEY;
  constructor(private prisma: PrismaService) {}

  async generateCareerRecommendations(dto: CareerRecommendationDto, userId: string) {
    try {
      const { system, user } = this.buildCareerRecommendationPrompt(dto);
      const response = await this.callGeminiAPI(user, system, true);

      const recommendations = {
        suggestedCareers: response,
        learningPath: null,
      };

      await this.prisma.recommendation.create({
        data: {
          userId,
          suggestedCareers: JSON.stringify(response),
        },
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      if (error instanceof Error) console.error(error.stack);
      throw new Error('Failed to generate career recommendations');
    }
  }

  async generateLearningPath(dto: LearningPathDto, userId: string) {
    try {
      const { system, user } = this.buildLearningPathPrompt(dto);
      const response = await this.callGeminiAPI(user, system, true);

      const learningPath = {
        careerPath: dto.careerPath,
        learningPath: response,
      };

      const existingRecommendation = await this.prisma.recommendation.findFirst({
        where: { userId },
      });

      if (existingRecommendation) {
        await this.prisma.recommendation.update({
          where: { id: existingRecommendation.id },
          data: {
            learningPath: JSON.stringify(response),
          },
        });
      } else {
        await this.prisma.recommendation.create({
          data: {
            userId,
            learningPath: JSON.stringify(response),
          },
        });
      }

      return learningPath;
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw new Error('Failed to generate learning path');
    }
  }

  async getMentorRecommendations(userId: string) {
    try {
      const studentProfile = await this.prisma.profile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      const mentors = await this.prisma.user.findMany({
        where: { role: 'MENTOR' },
        include: { profile: true },
        take: 50, 
      });

      if (mentors.length === 0) {
        return [];
      }

      const { system, user } = this.buildMentorMatchingPrompt(studentProfile, mentors);
      const response = await this.callGeminiAPI(user, system, true);

      const recommendations = Array.isArray(response) ? response : [];
      
      return recommendations.map((rec: any) => {
        const mentor = mentors.find(m => m.id === rec.mentorId);
        return {
          ...rec,
          mentorName: mentor ? mentor.name : 'Unknown Mentor',
          mentorEmail: mentor ? mentor.email : '',
          mentorId: mentor ? mentor.id : rec.mentorId,
        };
      });

    } catch (error) {
      console.error('Error generating mentor recommendations:', error);
      throw new Error('Failed to generate mentor recommendations');
    }
  }

  async chatWithAI(message: string, context?: any) {
    try {
      const { system, user } = this.buildChatPrompt(message, context);
      const response = await this.callGeminiAPI(user, system, false);
      return { response };
    } catch (error) {
      console.error('Error in AI chat DETAILS:', error);
      throw new Error('Failed to process chat message');
    }
  }

  // --- Prompt Builders (Now returning distinct System and User parts) ---

  private buildCareerRecommendationPrompt(dto: CareerRecommendationDto) {
    return {
      system: `You are an expert career counselor. Analyze the student's profile and suggest 3 specific, highly suitable career paths. 
      Format your response strictly as a JSON array with objects containing the following keys: title, description (2-3 sentences), requiredSkills, salaryRange, growthProspects, and matchReason. Do not include markdown formatting like \`\`\`json.`,
      user: `Student Profile:
      - Skills: ${dto.skills}
      - Interests: ${dto.interests}
      - Education: ${dto.education || 'Not specified'}
      - Goals: ${dto.goals || 'Not specified'}`
    };
  }

  private buildLearningPathPrompt(dto: LearningPathDto) {
    return {
      system: `You are a technical curriculum designer. Create a detailed, phase-by-phase learning roadmap.
      Format strictly as a JSON object with a 'phases' array. Each phase must contain: name, duration, skills, resources, projects, and milestones. Do not include markdown formatting.`,
      user: `Target Career: ${dto.careerPath}
      Current skills: ${dto.currentSkills}
      Timeframe: ${dto.timeframe || '6-12 months'}`
    };
  }

  private buildMentorMatchingPrompt(studentProfile: any, mentors: any[]) {
    const studentContext = {
      name: studentProfile.user.name,
      skills: studentProfile.skills,
      interests: studentProfile.interests,
      goals: studentProfile.goals,
      education: studentProfile.education
    };

    const mentorsList = mentors.map(m => ({
      id: m.id,
      name: m.name,
      skills: m.profile?.skills || 'Not specified',
      interests: m.profile?.interests || 'Not specified',
      education: m.profile?.education || 'Not specified',
    }));

    return {
      system: `You are an expert implementation of a mentorship matching algorithm. Compare the student's profile against the available mentors and select the top 3-5 matches based on compatibility.
      Output exactly as a JSON Array of objects. Each object must have:
      - "mentorId": "string (must match input id exactly)"
      - "matchScore": number (0-100)
      - "reasoning": "string"`,
      user: `Student Profile:
      ${JSON.stringify(studentContext)}
      
      Available Mentors:
      ${JSON.stringify(mentorsList)}`
    };
  }

  private buildChatPrompt(message: string, context?: any) {
    return {
      system: `You are CareerCompass AI, an expert career guidance assistant. You help students and professionals with career advice, job search tips, skill development, and professional growth. Provide helpful, specific, and actionable advice. Keep your response conversational but professional.`,
      user: context 
        ? `User context: ${JSON.stringify(context)}\n\nUser message: ${message}`
        : `User message: ${message}`
    };
  }

  // --- API Caller ---

  private async callGeminiAPI(userPrompt: string, systemInstruction?: string, isJson: boolean = true, retries = 3): Promise<any> {
    const currentApiKey = process.env.GEMINI_API_KEY || this.apiKey;

    if (!currentApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Build the payload dynamically to include system instructions if provided
    const requestBody: any = {
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: isJson ? 'application/json' : 'text/plain',
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    let lastError: any;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios.post(
          `${this.geminiApiUrl}?key=${currentApiKey}`,
          requestBody,
          { headers: { 'Content-Type': 'application/json' } }
        );

        let content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Cleanup markdown artifacts just in case the model ignores the system prompt
        if (content && typeof content === 'string') {
          content = content.trim();
          content = content.replace(/^```(?:json)?\s*\n?/i, '');
          content = content.replace(/\n?```\s*$/i, '');
          content = content.trim();
        }

        if (!isJson) {
          return content;
        }

        try {
          return JSON.parse(content);
        } catch {
          console.warn('Failed to parse AI response as JSON:', content?.substring(0, 200));
          return content;
        }
      } catch (error: any) {
        lastError = error;
        if (error.response?.status === 503 && attempt < retries - 1) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          console.warn(`Gemini API overloaded (503). Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    console.error('Gemini API Error:', lastError?.response?.data || lastError?.message);
    throw new Error('Failed to communicate with AI service after multiple retries.');
  }
}