/**
 * Agentic Readiness Tests
 * Tests for "Is Agentic" score improvements
 */

describe('Agentic Readiness', () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

  describe('404 Recovery Links', () => {
    it('should return 404 status for non-existent paths', async () => {
      const response = await fetch(`${baseUrl}/some-path-that-does-not-exist`);
      expect(response.status).toBe(404);
    });

    it('should include recovery links in 404 page body', async () => {
      const response = await fetch(`${baseUrl}/some-path-that-does-not-exist`);
      const html = await response.text();
      
      expect(html).toContain('sitemap');
      expect(html).toContain('llms.txt');
      expect(html).toContain('sacratos.com');
    });
  });

  describe('Content Without JavaScript', () => {
    it('should have H1 tag in raw HTML', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      expect(html).toMatch(/<h1[^>]*>/i);
    });

    it('should have 500+ characters of content in raw HTML', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      // Extract text content (rough approximation)
      const textContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Should have substantial content
      expect(textContent.length).toBeGreaterThan(500);
      expect(textContent).toContain('Sacratos');
      expect(textContent).toContain('documentary');
    });

    it('should have proper heading structure', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      // Should have H1
      expect(html).toMatch(/<h1[^>]*>/i);
      // Should have H2s for structure
      expect(html).toMatch(/<h2[^>]*>/i);
    });
  });

  describe('Markdown Content Negotiation', () => {
    it('should serve HTML by default', async () => {
      const response = await fetch(`${baseUrl}/`);
      const contentType = response.headers.get('content-type');
      
      expect(contentType).toContain('text/html');
    });

    it('should serve markdown when Accept: text/markdown is sent', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: {
          'Accept': 'text/markdown'
        }
      });
      
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/markdown');
    });

    it('should include Vary header with Accept', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: {
          'Accept': 'text/markdown'
        }
      });
      
      const varyHeader = response.headers.get('vary');
      expect(varyHeader).toContain('Accept');
    });

    it('should return valid markdown content', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: {
          'Accept': 'text/markdown'
        }
      });
      
      const markdown = await response.text();
      expect(markdown).toContain('#');
      expect(markdown).toContain('Sacratos');
      expect(markdown).toContain('https://');
    });
  });

  describe('Trust Anchor Pages', () => {
    it('should have /about page with 500+ chars', async () => {
      const response = await fetch(`${baseUrl}/about`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain('About');
      expect(html).toContain('Sacratos');
    });

    it('should have /contact page with 500+ chars', async () => {
      const response = await fetch(`${baseUrl}/contact`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain('Contact');
      expect(html).toContain('mattia@sacratos.com');
    });

    it('should have /privacy page with 500+ chars', async () => {
      const response = await fetch(`${baseUrl}/privacy`);
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain('Privacy');
    });
  });

  describe('llms.txt', () => {
    it('should have llms.txt accessible', async () => {
      const response = await fetch(`${baseUrl}/llms.txt`);
      expect(response.status).toBe(200);
    });

    it('should include "when to use" section', async () => {
      const response = await fetch(`${baseUrl}/llms.txt`);
      const content = await response.text();
      
      expect(content).toContain('When to Use');
      expect(content).toContain('Use Sacratos when');
    });

    it('should include contact information', async () => {
      const response = await fetch(`${baseUrl}/llms.txt`);
      const content = await response.text();
      
      expect(content).toContain('mattia@sacratos.com');
      expect(content).toContain('sacratos.com');
    });
  });

  describe('Organization Schema', () => {
    it('should include Organization JSON-LD with contactPoint', async () => {
      const response = await fetch(`${baseUrl}/`);
      const html = await response.text();
      
      expect(html).toContain('application/ld+json');
      expect(html).toContain('@type":"Organization');
      expect(html).toContain('contactPoint');
      expect(html).toContain('mattia@sacratos.com');
    });
  });

  describe('Sitemap', () => {
    it('should include trust anchor pages in sitemap', async () => {
      const response = await fetch(`${baseUrl}/sitemap.xml`);
      const xml = await response.text();
      
      expect(xml).toContain('https://sacratos.com/about');
      expect(xml).toContain('https://sacratos.com/contact');
      expect(xml).toContain('https://sacratos.com/privacy');
    });

    it('should include homepage in sitemap', async () => {
      const response = await fetch(`${baseUrl}/sitemap.xml`);
      const xml = await response.text();
      
      expect(xml).toContain('https://sacratos.com/');
    });
  });
});
