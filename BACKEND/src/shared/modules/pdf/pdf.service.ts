import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as os from 'os'

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: puppeteer.Browser;

  async generatePDFfromHTML(html: string, options?: puppeteer.PDFOptions) {
    const osPlatform = os.platform();  
    let executablePath;
    if (/^win/i.test(osPlatform)) {
        executablePath = '';
    } else if (/^linux/i.test(osPlatform)) {
        executablePath = '/usr/bin/chromium-browser';
    }
    this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: executablePath,
        timeout: 0
    });
     const page = await this.browser.newPage(); 
    await page.setContent(html, { waitUntil: 'networkidle2' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      ...options,
    });
    await page.close();
    return pdf;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
        await this.browser.close(); 
      }
  }
}
