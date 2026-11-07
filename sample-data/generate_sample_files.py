import os
import fitz # PyMuPDF
import docx

contracts_dir = os.path.join(os.path.dirname(__file__), 'contracts')
os.makedirs(contracts_dir, exist_ok=True)

def create_pdf(filename, title, content_sections):
    filepath = os.path.join(contracts_dir, filename)
    doc = fitz.open()
    
    # Page 1
    page = doc.new_page(width=595, height=842) # A4
    y = 50
    page.insert_text((50, y), title.upper(), fontsize=16, fontname="helv", color=(0.08, 0.2, 0.35))
    y += 30
    page.insert_text((50, y), "DEMONSTRATION SAMPLE CONTRACT - FICTIONAL LEGAL DOCUMENT FOR TESTING", fontsize=8, color=(0.5, 0.5, 0.5))
    y += 30

    for section_title, text in content_sections:
        if y > 720:
            page = doc.new_page(width=595, height=842)
            y = 50
        page.insert_text((50, y), section_title, fontsize=12, fontname="helv", color=(0.1, 0.25, 0.45))
        y += 18
        
        # Word wrap text roughly
        words = text.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(" ".join(current_line)) > 75:
                lines.append(" ".join(current_line))
                current_line = []
        if current_line:
            lines.append(" ".join(current_line))
            
        for line in lines:
            if y > 780:
                page = doc.new_page(width=595, height=842)
                y = 50
            page.insert_text((50, y), line, fontsize=9.5, fontname="helv", color=(0.15, 0.15, 0.15))
            y += 14
        y += 15

    doc.save(filepath)
    doc.close()
    print(f"Created PDF: {filepath}")

def create_docx(filename, title, content_sections):
    filepath = os.path.join(contracts_dir, filename)
    doc = docx.Document()
    
    doc.add_heading(title, 0)
    p = doc.add_paragraph("DEMONSTRATION SAMPLE CONTRACT - FICTIONAL LEGAL DOCUMENT FOR TESTING")
    p.runs[0].font.size = docx.shared.Pt(8.5)
    p.runs[0].font.color.rgb = docx.shared.RGBColor(128, 128, 128)

    for section_title, text in content_sections:
        doc.add_heading(section_title, level=1)
        doc.add_paragraph(text)

    doc.save(filepath)
    print(f"Created DOCX: {filepath}")

# 1. First Vendor Agreement (Has Unlimited Liability -> Needs Lawyer Approval to create precedent)
create_pdf(
    "Sample_Contract_1_Vendor_Agreement_Unlimited_Liability.pdf",
    "Master Services & Cloud Vendor Agreement",
    [
        ("PARTIES AND EFFECTIVE DATE", 
         "This Master Services Agreement is entered into as of January 15, 2026, by and between Apex Global Technologies LLC ('Customer') and Apex Cloud Services Inc. ('Vendor'). The parties hereby agree to the terms herein."),
        ("SECTION 1. SCOPE OF SERVICES", 
         "Vendor shall deliver cloud orchestration, workload migration, and managed cluster maintenance in accordance with Service Level Schedule A."),
        ("SECTION 4. PAYMENT TERMS", 
         "Customer agrees to pay all undisputed invoices within Net 30 days of receipt. Total estimated annual contract value is $150,000 USD."),
        ("SECTION 8. LIMITATION OF LIABILITY (CRITICAL CLAUSE)", 
         "Neither party shall be subject to any limitation of liability for breaches of this agreement, and total aggregate liability shall be unlimited for all direct, indirect, and consequential claims arising thereunder."),
        ("SECTION 9. INDEMNIFICATION", 
         "Customer shall solely defend, indemnify and hold harmless Vendor and its directors from and against any and all claims, fines, and expenses arising out of this Agreement."),
        ("SECTION 11. TERM AND TERMINATION", 
         "This Agreement shall be effective for one (1) year from the Effective Date and shall automatically renew for successive one-year terms unless either party gives written notice at least 60 days prior to expiration."),
        ("SECTION 14. GOVERNING LAW", 
         "This Agreement shall be governed by and construed under the laws of the State of Delaware, without regard to principles of conflicts of law.")
    ]
)

# 2. Second Vendor Agreement (Tests Precedent Memory Recall from Contract 1!)
create_pdf(
    "Sample_Contract_2_Vendor_Agreement_Followup.pdf",
    "Enterprise Software & Supplier Agreement",
    [
        ("PARTIES AND RECITALS", 
         "This Supplier Agreement is made effective February 10, 2026, between Apex Global Technologies LLC and Horizon Data Infrastructure LLC ('Supplier')."),
        ("SECTION 2. DELIVERABLES", 
         "Supplier shall license high-throughput enterprise messaging queues and streaming analytics infrastructure."),
        ("SECTION 5. FEES AND COMMISSIONS", 
         "Annual subscription fee of $175,000 payable in quarterly tranches."),
        ("SECTION 8. AGGREGATE LIABILITY", 
         "Supplier liability under this Agreement shall not be subject to any limitation of liability, and both parties shall bear unlimited liability for any contractual breach."),
        ("SECTION 10. NOTICE AND TERMINATION", 
         "Agreement automatically renews for successive 12-month periods unless 60 days advance written notice of termination is tendered."),
        ("SECTION 15. JURISDICTION", 
         "Governed by the laws of the State of Delaware.")
    ]
)

# 3. Mutual NDA in DOCX format
create_docx(
    "Sample_Contract_3_Mutual_NDA.docx",
    "Mutual Non-Disclosure and Confidentiality Agreement",
    [
        ("1. Purpose", "The parties wish to explore a potential business partnership regarding artificial intelligence integrations."),
        ("2. Definition of Confidential Information", "Confidential Information includes all technical, trade secret, and proprietary software information disclosed in writing or orally."),
        ("3. Standard of Care", "Each party agrees to hold the other party's Confidential Information in strict confidence, exercising at least the same degree of care it uses for its own confidential information, for a period of three (3) years."),
        ("4. Governing Law", "This Agreement shall be governed by Delaware law.")
    ]
)

# 4. Scanned PDF Example (To prove OCR detection capability)
scanned_pdf = fitz.open()
scanned_page = scanned_pdf.new_page(width=595, height=842)
# Insert negligible text (< 30 chars) and a simulated raster rect
scanned_page.insert_text((200, 400), "[SCANNED IMAGE DATA]", fontsize=8, color=(0.8, 0.8, 0.8))
# draw a gray box representing scanned image
scanned_page.draw_rect(fitz.Rect(50, 50, 545, 790), color=(0.7, 0.7, 0.7), fill=(0.95, 0.95, 0.95))
scanned_pdf.save(os.path.join(contracts_dir, "Sample_Contract_4_Scanned_Document_Example.pdf"))
scanned_pdf.close()
print("Created Scanned Sample PDF.")
