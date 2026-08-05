import openai
import os
from typing import List, Dict, Any
from datetime import datetime

class JobMatcher:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your_openai_api_key_here":
            try:
                # Try to initialize OpenAI client
                self.client = openai.OpenAI(api_key=api_key)
                print("✅ OpenAI client initialized successfully")
            except Exception as e:
                print(f"⚠️ OpenAI client initialization failed: {e}")
                print("🔄 Using fallback matching instead")
                self.client = None
        else:
            print("⚠️ OpenAI API key not found, using fallback matching")
            self.client = None
    
    async def match_resume_with_job(self, resume_data: dict, job_data: dict) -> dict:
        """Match a resume with a job description and calculate match percentage"""
        if not self.client:
            # Use basic matching if OpenAI is not configured
            return self._basic_match_analysis(resume_data, job_data)
        
        try:
            # Use AI to analyze the match
            match_analysis = await self._analyze_match_with_ai(resume_data, job_data)
            
            return {
                "match_percentage": match_analysis["match_percentage"],
                "matched_skills": match_analysis["matched_skills"],
                "missing_skills": match_analysis["missing_skills"],
                "experience_match": match_analysis["experience_match"],
                "analysis": match_analysis["analysis"]
            }
        except Exception as e:
            # Fallback to basic matching if AI fails
            return self._basic_match_analysis(resume_data, job_data)
    
    async def _analyze_match_with_ai(self, resume_data: dict, job_data: dict) -> dict:
        """Use AI to analyze the match between resume and job"""
        prompt = f"""
        Analyze the match between this resume and job description.
        
        Resume Skills: {resume_data.get('skills', [])}
        Resume Experience: {resume_data.get('experience', [])}
        Resume Summary: {resume_data.get('summary', '')}
        
        Job Title: {job_data['title']}
        Job Description: {job_data['description']}
        Required Skills: {job_data.get('skills_required', [])}
        Requirements: {job_data.get('requirements', [])}
        
        Return a JSON object with:
        {{
            "match_percentage": 85.5,
            "matched_skills": ["Python", "React", "SQL"],
            "missing_skills": ["AWS", "Docker"],
            "experience_match": 80.0,
            "analysis": "Brief analysis of the match quality"
        }}
        
        Calculate match_percentage based on:
        - Skills match (40% weight)
        - Experience relevance (30% weight)
        - Overall fit (30% weight)
        
        Return only the JSON object.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert HR analyst. Analyze job-resume matches accurately and return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            import json
            analysis = json.loads(response.choices[0].message.content)
            return analysis
            
        except Exception as e:
            print(f"AI analysis failed: {str(e)}")
            return self._basic_match_analysis(resume_data, job_data)
    
    def _basic_match_analysis(self, resume_data: dict, job_data: dict) -> dict:
        """Basic matching analysis as fallback"""
        resume_skills = [skill.lower() for skill in resume_data.get('skills', [])]
        job_skills = [skill.lower() for skill in job_data.get('skills_required', [])]
        
        # Calculate skills match
        matched_skills = []
        missing_skills = []
        
        for job_skill in job_skills:
            if any(job_skill in resume_skill or resume_skill in job_skill 
                   for resume_skill in resume_skills):
                matched_skills.append(job_skill)
            else:
                missing_skills.append(job_skill)
        
        # Calculate match percentage
        if job_skills:
            skills_match_percentage = (len(matched_skills) / len(job_skills)) * 100
        else:
            skills_match_percentage = 0
        
        # Basic experience match (simplified)
        experience_match = 70.0  # Default value
        
        # Overall match percentage
        match_percentage = (skills_match_percentage * 0.6) + (experience_match * 0.4)
        
        return {
            "match_percentage": round(match_percentage, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "experience_match": experience_match,
            "analysis": f"Basic analysis: {len(matched_skills)}/{len(job_skills)} skills matched"
        }
    
    def calculate_skill_similarity(self, skill1: str, skill2: str) -> float:
        """Calculate similarity between two skills"""
        skill1_lower = skill1.lower().strip()
        skill2_lower = skill2.lower().strip()
        
        # Exact match
        if skill1_lower == skill2_lower:
            return 1.0
        
        # Check if one contains the other
        if skill1_lower in skill2_lower or skill2_lower in skill1_lower:
            return 0.8
        
        # Check for common keywords
        skill1_words = set(skill1_lower.split())
        skill2_words = set(skill2_lower.split())
        
        if skill1_words & skill2_words:  # Intersection
            return 0.6
        
        return 0.0
