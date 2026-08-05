import os
import openai
from typing import Optional
import PyPDF2
from docx import Document
import re
from models.schemas import ResumeParsed
from datetime import datetime

class ResumeParser:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your_openai_api_key_here":
            try:
                # Try to initialize OpenAI client with minimal parameters
                self.client = openai.OpenAI(api_key=api_key)
                print("✅ OpenAI client initialized successfully")
            except Exception as e:
                print(f"⚠️ OpenAI client initialization failed: {e}")
                print("🔄 Using enhanced fallback parsing instead")
                self.client = None
        else:
            print("⚠️ OpenAI API key not found, using fallback parsing")
            self.client = None
    
    async def parse_resume(self, file_path: str) -> ResumeParsed:
        """Parse resume file and extract information using AI"""
        try:
            # Extract text from file
            text = self._extract_text_from_file(file_path)
            
            # Use OpenAI to parse the resume
            parsed_data = await self._parse_with_ai(text)
            
            return ResumeParsed(
                name=parsed_data.get("name"),
                email=parsed_data.get("email"),
                phone=parsed_data.get("phone"),
                skills=parsed_data.get("skills", []),
                experience=parsed_data.get("experience", []),
                education=parsed_data.get("education", []),
                summary=parsed_data.get("summary"),
                parsed_at=datetime.utcnow()
            )
        except Exception as e:
            raise Exception(f"Error parsing resume: {str(e)}")
    
    def _extract_text_from_file(self, file_path: str) -> str:
        """Extract text from PDF or DOCX file"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self._extract_text_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
            return self._extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    async def _parse_with_ai(self, text: str) -> dict:
        """Use OpenAI to parse resume text and extract structured data"""
        prompt = f"""
        You are an expert resume parser. Extract the following information from this resume text and return ONLY a valid JSON object:

        {{
            "name": "Full name of the person",
            "email": "Email address if found",
            "phone": "Phone number if found",
            "skills": ["list", "of", "technical", "skills"],
            "experience": [
                {{
                    "title": "Job title",
                    "company": "Company name",
                    "duration": "Duration (e.g., 2020-2023)",
                    "description": "Brief job description"
                }}
            ],
            "education": [
                {{
                    "degree": "Degree name",
                    "institution": "Institution name",
                    "year": "Graduation year"
                }}
            ],
            "summary": "A 2-3 line professional summary highlighting key strengths and experience"
        }}

        Resume text:
        {text[:2000]}

        Return only the JSON object, no additional text or explanations.
        """
        
        if not self.client:
            # Fallback to basic text extraction if OpenAI is not configured
            return self._basic_text_extraction(text)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert resume parser. Extract information accurately and return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            # Parse the JSON response
            import json
            parsed_data = json.loads(response.choices[0].message.content)
            return parsed_data
            
        except Exception as e:
            # Fallback to basic text extraction if AI fails
            return self._basic_text_extraction(text)
    
    def _basic_text_extraction(self, text: str) -> dict:
        """Enhanced text extraction as fallback when AI fails"""
        print("🔄 Using enhanced fallback parsing...")
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        email = email_match.group() if email_match else None
        
        # Extract phone
        phone_pattern = r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phone_match = re.search(phone_pattern, text)
        phone = phone_match.group() if phone_match else None
        
        # Extract name (first line that looks like a name)
        lines = text.split('\n')
        name = None
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 2 and len(line) < 50 and not any(char.isdigit() for char in line):
                if not any(word in line.lower() for word in ['email', 'phone', 'address', 'resume', 'cv']):
                    name = line
                    break
        
        # Enhanced skills extraction
        common_skills = [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'mongodb',
            'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript',
            'machine learning', 'data analysis', 'project management', 'agile',
            'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'angular', 'vue',
            'express', 'django', 'flask', 'spring', 'laravel', 'rails',
            'mysql', 'postgresql', 'redis', 'elasticsearch', 'graphql',
            'rest api', 'microservices', 'devops', 'ci/cd', 'jenkins',
            'terraform', 'ansible', 'linux', 'unix', 'bash', 'powershell'
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Extract experience (look for job titles and companies)
        experience = []
        experience_keywords = ['experience', 'work', 'employment', 'career', 'professional']
        education_keywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd']
        
        lines = text.split('\n')
        current_section = None
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Check if we're in experience section
            if any(keyword in line_lower for keyword in experience_keywords):
                current_section = 'experience'
                continue
            elif any(keyword in line_lower for keyword in education_keywords):
                current_section = 'education'
                continue
            
            # Extract job titles and companies
            if current_section == 'experience' and line.strip():
                # Look for patterns like "Software Engineer at Company" or "Developer - Company"
                if any(word in line_lower for word in ['engineer', 'developer', 'manager', 'analyst', 'consultant', 'specialist']):
                    experience.append({
                        "title": line.strip(),
                        "company": "Company Name",
                        "duration": "Duration not specified",
                        "description": "Experience extracted from resume"
                    })
        
        # Extract education
        education = []
        for line in lines:
            line_lower = line.lower().strip()
            if any(word in line_lower for word in ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate']):
                education.append({
                    "degree": line.strip(),
                    "institution": "Institution Name",
                    "year": "Year not specified"
                })
        
        # Create a basic summary
        summary_parts = []
        if name:
            summary_parts.append(f"Professional profile for {name}")
        if found_skills:
            summary_parts.append(f"Skilled in {', '.join(found_skills[:5])}")
        if experience:
            summary_parts.append(f"With {len(experience)} years of experience")
        
        summary = ". ".join(summary_parts) + ". Resume parsed using enhanced text extraction."
        
        print(f"✅ Fallback parsing completed: Name={name}, Email={email}, Skills={len(found_skills)}, Experience={len(experience)}")
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": found_skills,
            "experience": experience,
            "education": education,
            "summary": summary
        }
