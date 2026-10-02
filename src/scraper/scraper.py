import requests
from bs4 import BeautifulSoup
import time

def scrape_dummy_jobs(job_title, location):
    # This is a placeholder since actual sites like Naukri/Indeed have strong anti-scraping protections.
    # In a real scenario, use official APIs or handled rate-limited scraping.
    print(f"Scraping jobs for {job_title} in {location}...")
    
    # Returning mock data to get the UI working
    return [
        {"title": f"Junior {job_title}", "company": "Tech Innovators", "location": location, "salary": "6-8 LPA"},
        {"title": f"Senior {job_title}", "company": "Global Solutions", "location": location, "salary": "12-18 LPA"},
        {"title": f"{job_title} Intern", "company": "StartupX", "location": location, "salary": "Stipend: 20k/month"}
    ]

if __name__ == "__main__":
    jobs = scrape_dummy_jobs("Python Developer", "Bengaluru")
    print(jobs)
