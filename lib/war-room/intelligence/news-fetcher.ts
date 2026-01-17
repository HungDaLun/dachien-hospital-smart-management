export interface RawNews {
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    description: string;
    content: string;
}

export class NewsFetcher {
    private apiKey = process.env.NEWS_API_KEY;

    async fetchNews(query: string): Promise<RawNews[]> {
        if (!this.apiKey) {
            console.warn('[NewsFetcher] No API Key found. Returning mock data.');
            return this.getMockNews(query);
        }

        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.apiKey}&pageSize=20&sortBy=publishedAt`);
            const data = await response.json();

            if (data.status !== 'ok') {
                console.error('[NewsFetcher] NewsAPI Error:', data.message || 'Unknown error');
                throw new Error(data.message || 'News API Error');
            }

            interface NewsApiArticle {
                title: string;
                source: { name: string };
                url: string;
                publishedAt: string;
                description: string;
                content: string;
            }

            return data.articles.map((a: NewsApiArticle) => ({
                title: a.title,
                source: a.source.name,
                url: a.url,
                publishedAt: a.publishedAt,
                description: a.description,
                content: a.content || a.description
            }));
        } catch (error) {
            console.error('[NewsFetcher] Fetch failed:', error);
            return [];
        }
    }

    private getMockNews(query: string): RawNews[] {
        return [
            {
                title: `Supply Chain Disruption in ${query} Sector`,
                source: 'Bloomberg Mock',
                url: '#',
                publishedAt: new Date().toISOString(),
                description: 'Major suppliers are facing delays due to raw material shortages.',
                content: 'Full report on supply chain issues affecting global markets...'
            },
            {
                title: `New Competitor Enters ${query} Market`,
                source: 'TechCrunch Mock',
                url: '#',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                description: 'A well-funded startup has announced a revolutionary product.',
                content: 'Analysis of the new entrant and their potential impact...'
            },
            {
                title: `Regulatory Changes for ${query}`,
                source: 'Reuters Mock',
                url: '#',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                description: 'Government announces new compliance requirements.',
                content: 'Detailed breakdown of the new laws taking effect next quarter...'
            }
        ];
    }
}
