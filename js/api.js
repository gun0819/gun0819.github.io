// 알라딘 API 연동
const bookAPI = {
    async searchAladin(query, page = 1) {
        if (!query.trim()) {
            return [];
        }

        console.log('🔍 알라딘 검색 시작:', query);

        try {
            const response = await fetch(`/.netlify/functions/aladin-search?query=${encodeURIComponent(query)}&page=${page}&ttbkey=${CONFIG.ALADIN_TTB_KEY}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('❌ API 오류:', data.error);
                throw new Error(data.error);
            }

            if (!data.item || data.item.length === 0) {
                return [];
            }

            return data.item.map(book => ({
                id: book.isbn13 || book.isbn || Date.now() + Math.random(),
                title: book.title,
                author: book.author,
                isbn: book.isbn13 || book.isbn,
                genre: book.categoryName ? book.categoryName.split('>').pop().trim() : '일반',
                cover: book.cover,
                publisher: book.publisher,
                pubDate: book.pubDate,
                description: book.description || ''
            }));

        } catch (error) {
            console.error('❌ 검색 에러:', error);
            throw error;
        }
    },

    async getBestseller(queryType = 'Bestseller') {
        console.log('📚 베스트셀러 가져오기:', queryType);
        
        try {
            const response = await fetch(`/.netlify/functions/aladin-search?queryType=${queryType}&ttbkey=${CONFIG.ALADIN_TTB_KEY}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('❌ API 오류:', data.error);
                throw new Error(data.error);
            }

            if (!data.item || data.item.length === 0) {
                return [];
            }

            return data.item.map((book, index) => ({
                id: book.isbn13 || book.isbn || Date.now() + Math.random(),
                title: book.title,
                author: book.author,
                isbn: book.isbn13 || book.isbn,
                genre: book.categoryName ? book.categoryName.split('>').pop().trim() : '일반',
                cover: book.cover,
                publisher: book.publisher,
                pubDate: book.pubDate,
                description: book.description || '',
                rank: index + 1
            }));

        } catch (error) {
            console.error('❌ 베스트셀러 에러:', error);
            return [];
        }
    }
};
