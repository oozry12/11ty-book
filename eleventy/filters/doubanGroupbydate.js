/* ***** ----------------------------------------------- ***** **
/* ***** RSS Date Filter
/* ***** ----------------------------------------------- ***** */

const _ = require("lodash");

module.exports = (data) => {
  // 先按照年份分组
  let result = _(data)
  .groupBy(x => x.created_time.substring(0, 4)) // group by year
  .map((value, key) => ({
    year: key,
    data: _(value).groupBy(x => x.created_time.substring(5, 7)) // group by month
              .map((v, k) => ({ month: k, data: v })).orderBy(['month'], ['desc']).value() // formate month data
  }))
  .orderBy(['year'], ['desc'])
  .value();

  return result;
};





// {
//   "data": [
//       {
//           "shelf_type": "complete",
//           "visibility": 0,
//           "item": {
//               "id": "https://neodb.social/movie/0P9RvOsBrrnJlXQeiT6w17&#34;,   
//               "type": "Movie",
//               "uuid": "0P9RvOsBrrnJlXQeiT6w17",
//               "url": "/movie/0P9RvOsBrrnJlXQeiT6w17",
//               "api_url": "/api/movie/0P9RvOsBrrnJlXQeiT6w17",
//               "category": "movie",
//               "parent_uuid": null,
//               "display_title": "陌路狂刀",
//               "external_resources": [
//                   { "url": "https://movie.douban.com/subject/36402339/&#34;    }
//               ],
//               "title": "陌路狂刀",
//               "brief": "天下大乱，齐王篡权，暗中诛杀太子遗嗣，卖炭翁田安邺无意中卷入此局，一番亦敌亦友的殊死争斗中，田安邺身上的秘密，以及当年梁城百姓殉城的真相也被揭开……",
//               "cover_image_url": "https://neodb.social/m/item/doubanmovie/2024/03/11/e54b25e0-83af-4eed-baa6-d48c02bb64d8.webp&#34;,   
//               "rating": null,
//               "rating_count": 1
//           },
//           "created_time": "2024-03-10T10:03:46Z",
//           "comment_text": "烂片",
//           "rating_grade": 4,
//           "tags": []
//       },
//       {
//           "shelf_type": "complete",
//           "visibility": 0,
//           "item": {
//               "id": "https://neodb.social/movie/6KMHyWIms9uoku0kRw83aA&#34;,   
//               "type": "Movie",
//               "uuid": "6KMHyWIms9uoku0kRw83aA",
//               "url": "/movie/6KMHyWIms9uoku0kRw83aA",
//               "api_url": "/api/movie/6KMHyWIms9uoku0kRw83aA",
//               "category": "movie",
//               "parent_uuid": null,
//               "display_title": "新秩序",
//               "external_resources": [
//                   { "url": "https://movie.douban.com/subject/35572588/&#34;    }
//               ],
//               "title": "新秩序",
//               "brief": "横跨黑白两道只手遮天的洪泰集团正值换选之际，一个神秘杀手陈安（张家辉 饰）却突然只身闯入这个是非混乱的旋涡，搅得洪泰集团大乱。身处警察阵营的麦朗汶（阮经天 饰）和黑帮阵营的马文康（王大陆 饰）也盯上了他……\n各方势力伺机而动，谁才是幕后的操控者？一场生猛混战一触即发。",
//               "cover_image_url": "https://neodb.social/m/movie/2022/05/1572232d9a-0e4c-4855-b86e-7fa5bf6c49d3.jpg&#34;,   
//               "rating": 6.4,
//               "rating_count": 8
//           },
//           "created_time": "2024-03-10T10:03:27Z",
//           "comment_text": "男版消失的他",
//           "rating_grade": 8,
//           "tags": []
//       },
//       {
//           "shelf_type": "complete",
//           "visibility": 0,
//           "item": {
//               "id": "https://neodb.social/tv/season/3q7cVrDwt0G7FgqNBI5J3B&#34;,   
//               "type": "TVSeason",
//               "uuid": "3q7cVrDwt0G7FgqNBI5J3B",
//               "url": "/tv/season/3q7cVrDwt0G7FgqNBI5J3B",
//               "api_url": "/api/tv/season/3q7cVrDwt0G7FgqNBI5J3B",
//               "category": "tv",
//               "parent_uuid": "3gueKynn2jufwZqzm22RWE",
//               "display_title": "杀人者的购物中心",
//               "external_resources": [
//                   { "url": "https://www.themoviedb.org/tv/215072/season/1&#34;    },
//                   { "url": "https://movie.douban.com/subject/36174946/&#34;    }
//               ],
//               "title": "杀人者的购物中心",
//               "brief": "在郑镇万（李栋旭 饰）突然过世后，他的侄女郑智安（金慧埈 饰）发现叔叔留下的可疑购物中心。她的叔叔是什么人？他在经营何种购物中心？在智安还不明白发生何事时，觊觎购物中心仓库的可疑顾客们便展开袭击。\n改剧改编自作家姜智英创作同名小说。",
//               "cover_image_url": "https://neodb.social/m/item/doubanmovie/2024/01/07/ed4c14c8-a0da-4897-b379-548c09542210.webp&#34;,   
//               "rating": 6.6,
//               "rating_count": 29
//           },
//           "created_time": "2024-02-25T15:28:46Z",
//           "comment_text": null,
//           "rating_grade": null,
//           "tags": []
//       }
//   ],
//   "pages": 28,
//   "count": 553
// }