// Netlify 서버리스 함수 - 알라딘 API 프록시
const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 (CORS preflight) 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GET 파라미터 추출
  const query = event.queryStringParameters.query || '';
  const page = event.queryStringParameters.page || 1;
  const ttbkey = event.queryStringParameters.ttbkey || 'ttbgun081901601001';

  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: '검색어가 필요합니다' })
    };
  }

  // 알라딘 API URL 생성
  const apiUrl = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ttbkey}&Query=${encodeURIComponent(query)}&QueryType=Keyword&MaxResults=20&start=${page}&SearchTarget=Book&output=js&Version=20131101&Cover=Big`;

  console.log('알라딘 API 요청:', apiUrl);

  return new Promise((resolve, reject) => {
    // HTTP 요청 (알라딘은 HTTPS가 아닌 HTTP 사용)
    http.get(apiUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // 응답이 JSON 형식인지 확인
          const jsonData = JSON.parse(data);
          
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify(jsonData)
          });
        } catch (error) {
          console.error('JSON 파싱 오류:', error);
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'API 응답 파싱 실패',
              details: error.message 
            })
          });
        }
      });

    }).on('error', (error) => {
      console.error('API 요청 오류:', error);
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: '알라딘 API 호출 실패',
          details: error.message 
        })
      });
    });
  });
};
