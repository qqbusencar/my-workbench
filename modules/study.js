/* ============================================================
   模块三：学习收获
   沪教牛津版教材体系 · 三年级起点 · 难度逐日递增
   每日：10个新词 / 5句听力 / 5句口语 · 答错2次进入待复习词库
   教材自动同步：版本号 + 上次同步日期
   单词 quiz：选选项 → 点「确认」→ 答错/答对
   听力 quiz：先听音频 → 4 选 1 → 点「确认」→ 显示原文
   ============================================================ */

const Study = {
  state: {
    tab: 'word', // word / listen / speak / review
  },

  /* ---------- 教材元数据（自动同步机制） ---------- */
  curriculumMeta: {
    version: 'V4.0.0',
    edition: '沪教牛津版 · 三年级起点 → 初三',
    totalStages: 14,
    wordsPerStage: 12,
    lastSyncDate: '2026-08-27',
    autoSync: true, // 启动时检测版本
  },

  /* ---------- 课程词库（按学期排列，难度递增） ---------- */
  curriculum: [
    { stage: '三年级上册', words: [
      { word: 'cat', phonetic: '/kæt/', pos: 'n.', meaning: '猫', example: 'I have a little cat.', exampleZh: '我有一只小猫。' },
      { word: 'dog', phonetic: '/dɒɡ/', pos: 'n.', meaning: '狗', example: 'The dog is running.', exampleZh: '那只狗在跑。' },
      { word: 'apple', phonetic: '/ˈæpl/', pos: 'n.', meaning: '苹果', example: 'I eat an apple every day.', exampleZh: '我每天吃一个苹果。' },
      { word: 'banana', phonetic: '/bəˈnɑːnə/', pos: 'n.', meaning: '香蕉', example: 'The banana is sweet.', exampleZh: '这个香蕉很甜。' },
      { word: 'red', phonetic: '/red/', pos: 'adj.', meaning: '红色的', example: 'My bag is red.', exampleZh: '我的书包是红色的。' },
      { word: 'blue', phonetic: '/bluː/', pos: 'adj.', meaning: '蓝色的', example: 'The sky is blue.', exampleZh: '天空是蓝色的。' },
      { word: 'big', phonetic: '/bɪɡ/', pos: 'adj.', meaning: '大的', example: 'This is a big apple.', exampleZh: '这是一个大苹果。' },
      { word: 'small', phonetic: '/smɔːl/', pos: 'adj.', meaning: '小的', example: 'I have a small dog.', exampleZh: '我有一只小狗。' },
      { word: 'run', phonetic: '/rʌn/', pos: 'v.', meaning: '跑；奔跑', example: 'I can run fast.', exampleZh: '我能跑得很快。' },
      { word: 'jump', phonetic: '/dʒʌmp/', pos: 'v.', meaning: '跳；跳跃', example: 'The rabbit can jump.', exampleZh: '兔子会跳。' },
      { word: 'happy', phonetic: '/ˈhæpi/', pos: 'adj.', meaning: '快乐的', example: 'I am happy today.', exampleZh: '我今天很快乐。' },
      { word: 'sad', phonetic: '/sæd/', pos: 'adj.', meaning: '悲伤的', example: 'Why are you sad?', exampleZh: '你为什么难过？' },
    ]},
    { stage: '三年级下册', words: [
      { word: 'spring', phonetic: '/sprɪŋ/', pos: 'n.', meaning: '春天', example: 'Spring is warm.', exampleZh: '春天很温暖。' },
      { word: 'summer', phonetic: '/ˈsʌmər/', pos: 'n.', meaning: '夏天', example: 'Summer is hot.', exampleZh: '夏天很热。' },
      { word: 'autumn', phonetic: '/ˈɔːtəm/', pos: 'n.', meaning: '秋天', example: 'Autumn is cool.', exampleZh: '秋天很凉爽。' },
      { word: 'winter', phonetic: '/ˈwɪntər/', pos: 'n.', meaning: '冬天', example: 'Winter is cold.', exampleZh: '冬天很冷。' },
      { word: 'warm', phonetic: '/wɔːm/', pos: 'adj.', meaning: '温暖的', example: 'The water is warm.', exampleZh: '水是温的。' },
      { word: 'flower', phonetic: '/ˈflaʊər/', pos: 'n.', meaning: '花', example: 'The flower is beautiful.', exampleZh: '这朵花很美。' },
      { word: 'tree', phonetic: '/triː/', pos: 'n.', meaning: '树', example: 'There is a tall tree.', exampleZh: '那里有一棵大树。' },
      { word: 'bird', phonetic: '/bɜːd/', pos: 'n.', meaning: '鸟', example: 'The bird can sing.', exampleZh: '鸟会唱歌。' },
      { word: 'fish', phonetic: '/fɪʃ/', pos: 'n.', meaning: '鱼', example: 'The fish is swimming.', exampleZh: '鱼在游泳。' },
      { word: 'rain', phonetic: '/reɪn/', pos: 'n./v.', meaning: '雨；下雨', example: 'I like the rain.', exampleZh: '我喜欢雨。' },
      { word: 'snow', phonetic: '/snəʊ/', pos: 'n./v.', meaning: '雪；下雪', example: 'The snow is white.', exampleZh: '雪是白色的。' },
      { word: 'wind', phonetic: '/wɪnd/', pos: 'n.', meaning: '风', example: 'The wind is strong.', exampleZh: '风很大。' },
    ]},
    { stage: '四年级上册', words: [
      { word: 'family', phonetic: '/ˈfæməli/', pos: 'n.', meaning: '家庭；家人', example: 'I love my family.', exampleZh: '我爱我的家人。' },
      { word: 'father', phonetic: '/ˈfɑːðər/', pos: 'n.', meaning: '父亲', example: 'My father is a teacher.', exampleZh: '我的爸爸是老师。' },
      { word: 'mother', phonetic: '/ˈmʌðər/', pos: 'n.', meaning: '母亲', example: 'My mother cooks well.', exampleZh: '我妈妈做饭很好吃。' },
      { word: 'sister', phonetic: '/ˈsɪstər/', pos: 'n.', meaning: '姐妹', example: 'My sister is eight.', exampleZh: '我妹妹八岁了。' },
      { word: 'brother', phonetic: '/ˈbrʌðər/', pos: 'n.', meaning: '兄弟', example: 'My brother likes football.', exampleZh: '我哥哥喜欢足球。' },
      { word: 'breakfast', phonetic: '/ˈbrekfəst/', pos: 'n.', meaning: '早餐', example: 'I have breakfast at seven.', exampleZh: '我七点吃早餐。' },
      { word: 'lunch', phonetic: '/lʌntʃ/', pos: 'n.', meaning: '午餐', example: 'We have lunch at school.', exampleZh: '我们在学校吃午餐。' },
      { word: 'dinner', phonetic: '/ˈdɪnər/', pos: 'n.', meaning: '晚餐', example: 'Dinner is ready.', exampleZh: '晚餐准备好了。' },
      { word: 'rice', phonetic: '/raɪs/', pos: 'n.', meaning: '米饭', example: 'I like rice and vegetables.', exampleZh: '我喜欢米饭和蔬菜。' },
      { word: 'noodles', phonetic: '/ˈnuːdlz/', pos: 'n.', meaning: '面条', example: 'The noodles are delicious.', exampleZh: '面条很好吃。' },
      { word: 'milk', phonetic: '/mɪlk/', pos: 'n.', meaning: '牛奶', example: 'I drink milk every morning.', exampleZh: '我每天早上喝牛奶。' },
      { word: 'egg', phonetic: '/eɡ/', pos: 'n.', meaning: '鸡蛋', example: 'I want two eggs.', exampleZh: '我想要两个鸡蛋。' },
    ]},
    { stage: '四年级下册', words: [
      { word: 'weather', phonetic: '/ˈweðər/', pos: 'n.', meaning: '天气', example: "How's the weather today?", exampleZh: '今天天气怎么样？' },
      { word: 'rainy', phonetic: '/ˈreɪni/', pos: 'adj.', meaning: '下雨的', example: 'It is a rainy day.', exampleZh: '今天是雨天。' },
      { word: 'windy', phonetic: '/ˈwɪndi/', pos: 'adj.', meaning: '有风的', example: 'It is windy outside.', exampleZh: '外面风很大。' },
      { word: 'sunny', phonetic: '/ˈsʌni/', pos: 'adj.', meaning: '晴朗的', example: 'It is sunny today.', exampleZh: '今天阳光明媚。' },
      { word: 'cloudy', phonetic: '/ˈklaʊdi/', pos: 'adj.', meaning: '多云的', example: 'The sky is cloudy.', exampleZh: '天空多云。' },
      { word: 'umbrella', phonetic: '/ʌmˈbrelə/', pos: 'n.', meaning: '雨伞', example: 'Take your umbrella.', exampleZh: '带上你的雨伞。' },
      { word: 'coat', phonetic: '/kəʊt/', pos: 'n.', meaning: '外套', example: 'Put on your coat.', exampleZh: '穿上你的外套。' },
      { word: 'shoes', phonetic: '/ʃuːz/', pos: 'n.', meaning: '鞋子', example: 'My shoes are new.', exampleZh: '我的鞋子是新的。' },
      { word: 'classroom', phonetic: '/ˈklɑːsruːm/', pos: 'n.', meaning: '教室', example: 'Our classroom is big.', exampleZh: '我们的教室很大。' },
      { word: 'blackboard', phonetic: '/ˈblækbɔːd/', pos: 'n.', meaning: '黑板', example: 'Look at the blackboard.', exampleZh: '看黑板。' },
      { word: 'picture', phonetic: '/ˈpɪktʃər/', pos: 'n.', meaning: '图片', example: 'This is a picture of my school.', exampleZh: '这是一张我学校的照片。' },
      { word: 'computer', phonetic: '/kəmˈpjuːtər/', pos: 'n.', meaning: '电脑', example: 'I play games on the computer.', exampleZh: '我在电脑上玩游戏。' },
    ]},
    { stage: '五年级上册', words: [
      { word: 'hobby', phonetic: '/ˈhɒbi/', pos: 'n.', meaning: '爱好', example: 'My hobby is reading.', exampleZh: '我的爱好是阅读。' },
      { word: 'swimming', phonetic: '/ˈswɪmɪŋ/', pos: 'n.', meaning: '游泳', example: 'I go swimming on Sundays.', exampleZh: '我周日去游泳。' },
      { word: 'dancing', phonetic: '/ˈdɑːnsɪŋ/', pos: 'n.', meaning: '跳舞', example: 'She likes dancing.', exampleZh: '她喜欢跳舞。' },
      { word: 'painting', phonetic: '/ˈpeɪntɪŋ/', pos: 'n.', meaning: '绘画', example: 'His painting is wonderful.', exampleZh: '他的画很棒。' },
      { word: 'weekend', phonetic: '/ˌwiːkˈend/', pos: 'n.', meaning: '周末', example: 'What do you do at the weekend?', exampleZh: '你周末做什么？' },
      { word: 'often', phonetic: '/ˈɒfn/', pos: 'adv.', meaning: '经常', example: 'I often play basketball.', exampleZh: '我经常打篮球。' },
      { word: 'sometimes', phonetic: '/ˈsʌmtaɪmz/', pos: 'adv.', meaning: '有时', example: 'Sometimes I walk to school.', exampleZh: '有时我走路去上学。' },
      { word: 'visit', phonetic: '/ˈvɪzɪt/', pos: 'v.', meaning: '拜访；参观', example: 'We visit the museum.', exampleZh: '我们参观博物馆。' },
      { word: 'grandparent', phonetic: '/ˈɡrænpeərənt/', pos: 'n.', meaning: '祖父母', example: 'I visit my grandparents.', exampleZh: '我去看望祖父母。' },
      { word: 'library', phonetic: '/ˈlaɪbrəri/', pos: 'n.', meaning: '图书馆', example: 'The library is quiet.', exampleZh: '图书馆很安静。' },
      { word: 'cinema', phonetic: '/ˈsɪnəmə/', pos: 'n.', meaning: '电影院', example: 'Let us go to the cinema.', exampleZh: '我们去看电影吧。' },
      { word: 'interesting', phonetic: '/ˈɪntrəstɪŋ/', pos: 'adj.', meaning: '有趣的', example: 'The book is interesting.', exampleZh: '这本书很有趣。' },
    ]},
    { stage: '五年级下册', words: [
      { word: 'travel', phonetic: '/ˈtrævl/', pos: 'v./n.', meaning: '旅行', example: 'I want to travel the world.', exampleZh: '我想环游世界。' },
      { word: 'train', phonetic: '/treɪn/', pos: 'n.', meaning: '火车', example: 'The train is fast.', exampleZh: '火车很快。' },
      { word: 'plane', phonetic: '/pleɪn/', pos: 'n.', meaning: '飞机', example: 'The plane takes off.', exampleZh: '飞机起飞了。' },
      { word: 'ticket', phonetic: '/ˈtɪkɪt/', pos: 'n.', meaning: '票', example: 'I bought two tickets.', exampleZh: '我买了两张票。' },
      { word: 'hotel', phonetic: '/həʊˈtel/', pos: 'n.', meaning: '旅馆', example: 'The hotel is near the sea.', exampleZh: '旅馆在海边。' },
      { word: 'beach', phonetic: '/biːtʃ/', pos: 'n.', meaning: '海滩', example: 'We play on the beach.', exampleZh: '我们在海滩上玩。' },
      { word: 'mountain', phonetic: '/ˈmaʊntən/', pos: 'n.', meaning: '山', example: 'The mountain is very high.', exampleZh: '这座山很高。' },
      { word: 'famous', phonetic: '/ˈfeɪməs/', pos: 'adj.', meaning: '著名的', example: 'It is a famous place.', exampleZh: '这是一个著名的地方。' },
      { word: 'delicious', phonetic: '/dɪˈlɪʃəs/', pos: 'adj.', meaning: '美味的', example: 'The food is delicious.', exampleZh: '食物很美味。' },
      { word: 'expensive', phonetic: '/ɪkˈspensɪv/', pos: 'adj.', meaning: '昂贵的', example: 'The watch is expensive.', exampleZh: '这块表很贵。' },
      { word: 'photo', phonetic: '/ˈfəʊtəʊ/', pos: 'n.', meaning: '照片', example: 'Let us take a photo.', exampleZh: '我们拍张照吧。' },
      { word: 'map', phonetic: '/mæp/', pos: 'n.', meaning: '地图', example: 'Look at the map.', exampleZh: '看一下地图。' },
    ]},
    { stage: '六年级上册', words: [
      { word: 'future', phonetic: '/ˈfjuːtʃər/', pos: 'n.', meaning: '未来', example: 'What will the future be like?', exampleZh: '未来会是什么样子？' },
      { word: 'scientist', phonetic: '/ˈsaɪəntɪst/', pos: 'n.', meaning: '科学家', example: 'I want to be a scientist.', exampleZh: '我想成为一名科学家。' },
      { word: 'dream', phonetic: '/driːm/', pos: 'n.', meaning: '梦想', example: 'My dream is to fly.', exampleZh: '我的梦想是飞翔。' },
      { word: 'space', phonetic: '/speɪs/', pos: 'n.', meaning: '太空', example: 'The rocket flies into space.', exampleZh: '火箭飞向太空。' },
      { word: 'planet', phonetic: '/ˈplænɪt/', pos: 'n.', meaning: '行星', example: 'The Earth is a planet.', exampleZh: '地球是一颗行星。' },
      { word: 'robot', phonetic: '/ˈrəʊbɒt/', pos: 'n.', meaning: '机器人', example: 'The robot can walk.', exampleZh: '机器人会走路。' },
      { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', pos: 'n.', meaning: '环境', example: 'We should protect the environment.', exampleZh: '我们应该保护环境。' },
      { word: 'pollution', phonetic: '/pəˈluːʃn/', pos: 'n.', meaning: '污染', example: 'Air pollution is serious.', exampleZh: '空气污染很严重。' },
      { word: 'protect', phonetic: '/prəˈtekt/', pos: 'v.', meaning: '保护', example: 'We protect the animals.', exampleZh: '我们保护动物。' },
      { word: 'energy', phonetic: '/ˈenədʒi/', pos: 'n.', meaning: '能源；能量', example: 'Save energy, please.', exampleZh: '请节约能源。' },
      { word: 'reuse', phonetic: '/ˌriːˈjuːz/', pos: 'v.', meaning: '再利用', example: 'We can reuse the paper.', exampleZh: '我们可以重复利用纸张。' },
      { word: 'important', phonetic: '/ɪmˈpɔːtnt/', pos: 'adj.', meaning: '重要的', example: 'Water is important.', exampleZh: '水很重要。' },
    ]},
    { stage: '六年级下册', words: [
      { word: 'subject', phonetic: '/ˈsʌbdʒɪkt/', pos: 'n.', meaning: '科目', example: 'My favourite subject is English.', exampleZh: '我最喜欢的科目是英语。' },
      { word: 'history', phonetic: '/ˈhɪstri/', pos: 'n.', meaning: '历史', example: 'China has a long history.', exampleZh: '中国有悠久的历史。' },
      { word: 'geography', phonetic: '/dʒiˈɒɡrəfi/', pos: 'n.', meaning: '地理', example: 'Geography is interesting.', exampleZh: '地理很有趣。' },
      { word: 'exam', phonetic: '/ɪɡˈzæm/', pos: 'n.', meaning: '考试', example: 'The exam is coming.', exampleZh: '考试要来了。' },
      { word: 'nervous', phonetic: '/ˈnɜːvəs/', pos: 'adj.', meaning: '紧张的', example: 'Do not be nervous.', exampleZh: '不要紧张。' },
      { word: 'confident', phonetic: '/ˈkɒnfɪdənt/', pos: 'adj.', meaning: '自信的', example: 'Be confident in yourself.', exampleZh: '对自己有信心。' },
      { word: 'prepare', phonetic: '/prɪˈpeər/', pos: 'v.', meaning: '准备', example: 'I prepare for the test.', exampleZh: '我为考试做准备。' },
      { word: 'progress', phonetic: '/ˈprəʊɡres/', pos: 'n.', meaning: '进步', example: 'You made great progress.', exampleZh: '你取得了很大进步。' },
      { word: 'friendship', phonetic: '/ˈfrendʃɪp/', pos: 'n.', meaning: '友谊', example: 'Our friendship is forever.', exampleZh: '我们的友谊地久天长。' },
      { word: 'memory', phonetic: '/ˈmeməri/', pos: 'n.', meaning: '记忆', example: 'It is a sweet memory.', exampleZh: '这是一段甜蜜的回忆。' },
      { word: 'graduate', phonetic: '/ˈɡrædʒueɪt/', pos: 'v.', meaning: '毕业', example: 'I will graduate soon.', exampleZh: '我很快就要毕业了。' },
      { word: 'wish', phonetic: '/wɪʃ/', pos: 'v./n.', meaning: '希望；祝愿', example: 'I wish you good luck.', exampleZh: '祝你好运。' },
    ]},
    { stage: '初中一年级上册', words: [
      { word: 'festival', phonetic: '/ˈfestɪvl/', pos: 'n.', meaning: '节日', example: 'The Spring Festival is coming.', exampleZh: '春节要到了。' },
      { word: 'traditional', phonetic: '/trəˈdɪʃənl/', pos: 'adj.', meaning: '传统的', example: 'It is a traditional food.', exampleZh: '这是一种传统食物。' },
      { word: 'celebrate', phonetic: '/ˈselɪbreɪt/', pos: 'v.', meaning: '庆祝', example: 'We celebrate the New Year.', exampleZh: '我们庆祝新年。' },
      { word: 'relative', phonetic: '/ˈrelətɪv/', pos: 'n.', meaning: '亲戚', example: 'I visit my relatives.', exampleZh: '我拜访我的亲戚。' },
      { word: 'culture', phonetic: '/ˈkʌltʃər/', pos: 'n.', meaning: '文化', example: 'I love Chinese culture.', exampleZh: '我热爱中国文化。' },
      { word: 'ancient', phonetic: '/ˈeɪnʃənt/', pos: 'adj.', meaning: '古代的', example: 'It is an ancient city.', exampleZh: '这是一座古城。' },
      { word: 'modern', phonetic: '/ˈmɒdn/', pos: 'adj.', meaning: '现代的', example: 'Shanghai is a modern city.', exampleZh: '上海是一座现代化城市。' },
      { word: 'society', phonetic: '/səˈsaɪəti/', pos: 'n.', meaning: '社会', example: 'We live in society.', exampleZh: '我们生活在社会中。' },
      { word: 'develop', phonetic: '/dɪˈveləp/', pos: 'v.', meaning: '发展', example: 'The city develops fast.', exampleZh: '这座城市发展很快。' },
      { word: 'journey', phonetic: '/ˈdʒɜːni/', pos: 'n.', meaning: '旅行；旅程', example: 'We had a long journey.', exampleZh: '我们进行了一次长途旅行。' },
      { word: 'experience', phonetic: '/ɪkˈspɪəriəns/', pos: 'n.', meaning: '经历；经验', example: 'It was a great experience.', exampleZh: '这是一次很棒的经历。' },
      { word: 'together', phonetic: '/təˈɡeðər/', pos: 'adv.', meaning: '一起', example: 'Let us learn together.', exampleZh: '让我们一起学习。' },
    ]},
    { stage: '初中一年级下册', words: [
      { word: 'opportunity', phonetic: '/ˌɒpəˈtjuːnəti/', pos: 'n.', meaning: '机会', example: 'It is a good opportunity.', exampleZh: '这是一个好机会。' },
      { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', pos: 'n.', meaning: '挑战', example: 'I enjoy the challenge.', exampleZh: '我享受挑战。' },
      { word: 'independent', phonetic: '/ˌɪndɪˈpendənt/', pos: 'adj.', meaning: '独立的', example: 'She is independent.', exampleZh: '她很独立。' },
      { word: 'responsibility', phonetic: '/rɪˌspɒnsəˈbɪləti/', pos: 'n.', meaning: '责任', example: 'It is my responsibility.', exampleZh: '这是我的责任。' },
      { word: 'communicate', phonetic: '/kəˈmjuːnɪkeɪt/', pos: 'v.', meaning: '交流', example: 'We communicate in English.', exampleZh: '我们用英语交流。' },
      { word: 'cooperation', phonetic: '/kəʊˌɒpəˈreɪʃn/', pos: 'n.', meaning: '合作', example: 'Thank you for your cooperation.', exampleZh: '感谢你的合作。' },
      { word: 'create', phonetic: '/kriˈeɪt/', pos: 'v.', meaning: '创造', example: 'Let us create something new.', exampleZh: '让我们创造些新东西。' },
      { word: 'imagine', phonetic: '/ɪˈmædʒɪn/', pos: 'v.', meaning: '想象', example: 'Imagine you can fly.', exampleZh: '想象你能飞。' },
      { word: 'achieve', phonetic: '/əˈtʃiːv/', pos: 'v.', meaning: '实现；达到', example: 'Work hard to achieve your dream.', exampleZh: '努力实现你的梦想。' },
      { word: 'encourage', phonetic: '/ɪnˈkʌrɪdʒ/', pos: 'v.', meaning: '鼓励', example: 'My teacher encourages me.', exampleZh: '老师鼓励我。' },
      { word: 'patient', phonetic: '/ˈpeɪʃnt/', pos: 'adj.', meaning: '耐心的', example: 'Be patient, please.', exampleZh: '请耐心一点。' },
      { word: 'knowledge', phonetic: '/ˈnɒlɪdʒ/', pos: 'n.', meaning: '知识', example: 'Knowledge is power.', exampleZh: '知识就是力量。' },
    ]},
    { stage: '初中二年级上册', words: [
      { word: 'technology', phonetic: '/tekˈnɒlədʒi/', pos: 'n.', meaning: '科技', example: 'Technology changes our life.', exampleZh: '科技改变我们的生活。' },
      { word: 'Internet', phonetic: '/ˈɪntənet/', pos: 'n.', meaning: '互联网', example: 'We use the Internet to study.', exampleZh: '我们用互联网来学习。' },
      { word: 'healthy', phonetic: '/ˈhelθi/', pos: 'adj.', meaning: '健康的', example: 'Eat healthy food every day.', exampleZh: '每天吃健康的食物。' },
      { word: 'volunteer', phonetic: '/ˌvɒlənˈtɪər/', pos: 'n.', meaning: '志愿者', example: 'He is a volunteer at the library.', exampleZh: '他是图书馆的一名志愿者。' },
      { word: 'community', phonetic: '/kəˈmjuːnəti/', pos: 'n.', meaning: '社区', example: 'We help our community.', exampleZh: '我们帮助我们的社区。' },
      { word: 'recycle', phonetic: '/riːˈsaɪkl/', pos: 'v.', meaning: '回收；循环利用', example: 'We recycle paper and bottles.', exampleZh: '我们回收纸张和瓶子。' },
      { word: 'tradition', phonetic: '/trəˈdɪʃn/', pos: 'n.', meaning: '传统', example: 'Spring Festival is a tradition.', exampleZh: '春节是一个传统。' },
      { word: 'trip', phonetic: '/trɪp/', pos: 'n.', meaning: '旅行；郊游', example: 'We had a school trip.', exampleZh: '我们进行了一次学校郊游。' },
      { word: 'share', phonetic: '/ʃeər/', pos: 'v.', meaning: '分享；共享', example: 'Share your happiness with friends.', exampleZh: '和朋友分享你的快乐。' },
      { word: 'bright', phonetic: '/braɪt/', pos: 'adj.', meaning: '明亮的；聪明的', example: 'The classroom is bright.', exampleZh: '教室很明亮。' },
      { word: 'goal', phonetic: '/ɡəʊl/', pos: 'n.', meaning: '目标；进球', example: 'Work hard to reach your goal.', exampleZh: '努力去达成你的目标。' },
      { word: 'polite', phonetic: '/pəˈlaɪt/', pos: 'adj.', meaning: '有礼貌的', example: 'Be polite to others.', exampleZh: '对别人要有礼貌。' },
    ]},
    { stage: '初中二年级下册', words: [
      { word: 'invention', phonetic: '/ɪnˈvenʃn/', pos: 'n.', meaning: '发明', example: 'The telephone is a great invention.', exampleZh: '电话是一项伟大的发明。' },
      { word: 'improve', phonetic: '/ɪmˈpruːv/', pos: 'v.', meaning: '改善；提高', example: 'Practice improves your English.', exampleZh: '练习能提高你的英语。' },
      { word: 'natural', phonetic: '/ˈnætʃrəl/', pos: 'adj.', meaning: '自然的', example: 'We should love the natural world.', exampleZh: '我们应该热爱大自然。' },
      { word: 'wonder', phonetic: '/ˈwʌndər/', pos: 'n.', meaning: '奇迹', example: 'The Great Wall is a wonder.', exampleZh: '长城是一个奇迹。' },
      { word: 'describe', phonetic: '/dɪˈskraɪb/', pos: 'v.', meaning: '描述', example: 'Can you describe your friend?', exampleZh: '你能描述一下你的朋友吗？' },
      { word: 'emotion', phonetic: '/ɪˈməʊʃn/', pos: 'n.', meaning: '情绪；情感', example: 'Music expresses our emotion.', exampleZh: '音乐表达我们的情感。' },
      { word: 'rule', phonetic: '/ruːl/', pos: 'n.', meaning: '规则', example: 'We must follow the school rules.', exampleZh: '我们必须遵守校规。' },
      { word: 'spaceship', phonetic: '/ˈspeɪsʃɪp/', pos: 'n.', meaning: '宇宙飞船', example: 'A spaceship flies to the moon.', exampleZh: '宇宙飞船飞向月球。' },
      { word: 'surface', phonetic: '/ˈsɜːfɪs/', pos: 'n.', meaning: '表面', example: 'The surface of the lake is calm.', exampleZh: '湖面很平静。' },
      { word: 'force', phonetic: '/fɔːs/', pos: 'n.', meaning: '力量；力', example: 'Gravity is a natural force.', exampleZh: '重力是一种自然力。' },
      { word: 'method', phonetic: '/ˈmeθəd/', pos: 'n.', meaning: '方法', example: 'This is a good study method.', exampleZh: '这是一个好的学习方法。' },
      { word: 'support', phonetic: '/səˈpɔːt/', pos: 'v./n.', meaning: '支持', example: 'My family supports me.', exampleZh: '我的家人支持我。' },
    ]},
    { stage: '初中三年级上册', words: [
      { word: 'achievement', phonetic: '/əˈtʃiːvmənt/', pos: 'n.', meaning: '成就', example: 'Hard work brings achievement.', exampleZh: '努力带来成就。' },
      { word: 'career', phonetic: '/kəˈrɪər/', pos: 'n.', meaning: '职业；事业', example: 'She plans her career carefully.', exampleZh: '她认真规划自己的职业。' },
      { word: 'citizen', phonetic: '/ˈsɪtɪzn/', pos: 'n.', meaning: '公民', example: 'We are responsible citizens.', exampleZh: '我们是负责任的公民。' },
      { word: 'climate', phonetic: '/ˈklaɪmət/', pos: 'n.', meaning: '气候', example: 'Climate change is serious.', exampleZh: '气候变化很严重。' },
      { word: 'literature', phonetic: '/ˈlɪtrətʃə(r)/', pos: 'n.', meaning: '文学', example: 'He loves Chinese literature.', exampleZh: '他热爱中国文学。' },
      { word: 'heritage', phonetic: '/ˈherɪtɪdʒ/', pos: 'n.', meaning: '遗产', example: 'The Great Wall is world heritage.', exampleZh: '长城是世界遗产。' },
      { word: 'wisdom', phonetic: '/ˈwɪzdəm/', pos: 'n.', meaning: '智慧', example: 'Old people have great wisdom.', exampleZh: '老年人拥有大智慧。' },
      { word: 'duty', phonetic: '/ˈdjuːti/', pos: 'n.', meaning: '责任；义务', example: 'It is our duty to protect nature.', exampleZh: '保护自然是我们的责任。' },
      { word: 'global', phonetic: '/ˈɡləʊbl/', pos: 'adj.', meaning: '全球的', example: 'We face global challenges.', exampleZh: '我们面对全球性的挑战。' },
      { word: 'innovation', phonetic: '/ˌɪnəˈveɪʃn/', pos: 'n.', meaning: '创新', example: 'Innovation drives progress.', exampleZh: '创新推动进步。' },
      { word: 'harmony', phonetic: '/ˈhɑːməni/', pos: 'n.', meaning: '和谐', example: 'We live in harmony with nature.', exampleZh: '我们与自然和谐共处。' },
      { word: 'spirit', phonetic: '/ˈspɪrɪt/', pos: 'n.', meaning: '精神；灵魂', example: 'The spirit of helping others is great.', exampleZh: '助人的精神很伟大。' },
    ]},
    { stage: '初中三年级下册', words: [
      { word: 'ambition', phonetic: '/æmˈbɪʃn/', pos: 'n.', meaning: '抱负；野心', example: 'He has a big ambition.', exampleZh: '他有远大的抱负。' },
      { word: 'perseverance', phonetic: '/ˌpɜːsəˈvɪərəns/', pos: 'n.', meaning: '毅力', example: 'Perseverance leads to success.', exampleZh: '毅力通向成功。' },
      { word: 'artificial', phonetic: '/ˌɑːtɪˈfɪʃl/', pos: 'adj.', meaning: '人工的', example: 'Artificial intelligence helps us.', exampleZh: '人工智能帮助我们。' },
      { word: 'horizon', phonetic: '/həˈraɪzn/', pos: 'n.', meaning: '地平线；视野', example: 'Study broadens your horizon.', exampleZh: '学习拓宽你的视野。' },
      { word: 'lifelong', phonetic: '/ˈlaɪflɒŋ/', pos: 'adj.', meaning: '终身的', example: 'Reading is a lifelong habit.', exampleZh: '阅读是终身的习惯。' },
      { word: 'frontier', phonetic: '/ˈfrʌntɪər/', pos: 'n.', meaning: '前沿；边界', example: 'Space is the new frontier.', exampleZh: '太空是新的前沿。' },
      { word: 'contribution', phonetic: '/ˌkɒntrɪˈbjuːʃn/', pos: 'n.', meaning: '贡献', example: 'Everyone can make a contribution.', exampleZh: '每个人都能做出贡献。' },
      { word: 'grateful', phonetic: '/ˈɡreɪtfl/', pos: 'adj.', meaning: '感激的', example: 'We are grateful for help.', exampleZh: '我们感激他人的帮助。' },
      { word: 'vision', phonetic: '/ˈvɪʒn/', pos: 'n.', meaning: '视野；愿景', example: 'He has a clear vision for the future.', exampleZh: '他对未来有清晰的愿景。' },
      { word: 'breakthrough', phonetic: '/ˈbreɪkθruː/', pos: 'n.', meaning: '突破', example: 'Science needs breakthroughs.', exampleZh: '科学需要突破。' },
      { word: 'dignity', phonetic: '/ˈdɪɡnəti/', pos: 'n.', meaning: '尊严', example: 'Work gives people dignity.', exampleZh: '工作给人尊严。' },
      { word: 'eternity', phonetic: '/ɪˈtɜːnəti/', pos: 'n.', meaning: '永恒', example: 'Art lasts for eternity.', exampleZh: '艺术永恒流传。' },
    ]},
  ],

  // 平铺词表（按学期顺序 = 难度递增）
  flatPool: null,
  buildPool() {
    if (!this.flatPool) {
      this.flatPool = [];
      this.curriculum.forEach((c, ci) => {
        c.words.forEach(w => this.flatPool.push({ ...w, stage: c.stage, stageIdx: ci }));
      });
    }
    return this.flatPool;
  },

  /* ---------- 听力句库 ---------- */
  listeningPool: [
    { text: 'Good morning, Miss Li.', zh: '早上好，李老师。' },
    { text: 'How are you? I am fine, thank you.', zh: '你好吗？我很好，谢谢。' },
    { text: "What is this? It is a cat.", zh: '这是什么？它是一只猫。' },
    { text: 'I can see a big apple.', zh: '我能看见一个大苹果。' },
    { text: 'What colour is it? It is blue.', zh: '它是什么颜色？它是蓝色的。' },
    { text: 'Spring is warm and beautiful.', zh: '春天温暖又美丽。' },
    { text: 'The birds are singing in the tree.', zh: '鸟儿在树上唱歌。' },
    { text: 'It is rainy today. Take your umbrella.', zh: '今天下雨，带上雨伞。' },
    { text: 'How many flowers can you see?', zh: '你能看见多少朵花？' },
    { text: 'My family has four people.', zh: '我家有四口人。' },
    { text: 'I have breakfast at seven oclock.', zh: '我七点吃早餐。' },
    { text: 'What would you like for dinner?', zh: '晚饭你想吃什么？' },
    { text: 'How is the weather today?', zh: '今天天气怎么样？' },
    { text: 'Our classroom is big and bright.', zh: '我们的教室又大又亮。' },
    { text: 'Put on your coat. It is cold outside.', zh: '穿上外套，外面很冷。' },
    { text: 'What is your hobby? I like swimming.', zh: '你的爱好是什么？我喜欢游泳。' },
    { text: 'I often read books in the library.', zh: '我经常在图书馆看书。' },
    { text: 'What do you do at the weekend?', zh: '你周末做什么？' },
    { text: 'We will travel to Beijing by train.', zh: '我们将坐火车去北京旅行。' },
    { text: 'The beach is beautiful in summer.', zh: '夏天的海滩很美。' },
    { text: 'How much is the ticket?', zh: '票价多少钱？' },
    { text: 'I want to be a scientist in the future.', zh: '我将来想成为一名科学家。' },
    { text: 'We should protect the environment.', zh: '我们应该保护环境。' },
    { text: 'The rocket flies into space.', zh: '火箭飞向太空。' },
    { text: 'My favourite subject is English.', zh: '我最喜欢的科目是英语。' },
    { text: 'Do not be nervous. Be confident!', zh: '别紧张，要自信！' },
    { text: 'Our friendship will last forever.', zh: '我们的友谊将天长地久。' },
    { text: 'We celebrate the Spring Festival together.', zh: '我们一起庆祝春节。' },
    { text: 'It is a good opportunity to learn.', zh: '这是学习的好机会。' },
    { text: 'Knowledge is power. Keep learning!', zh: '知识就是力量，坚持学习！' },
    { text: 'We should protect the environment by recycling.', zh: '我们应该通过回收来保护环境。' },
    { text: 'The Internet helps us learn new things every day.', zh: '互联网帮助我们每天学习新东西。' },
    { text: 'He is a volunteer at the community center.', zh: '他是社区中心的一名志愿者。' },
    { text: 'Eating healthy food keeps us strong.', zh: '吃健康的食物让我们身体强壮。' },
    { text: 'We should be polite to everyone around us.', zh: '我们应该对身边的每个人都有礼貌。' },
    { text: 'The telephone is one of the greatest inventions.', zh: '电话是最伟大的发明之一。' },
    { text: 'Practice improves your spoken English.', zh: '练习能提高你的英语口语。' },
    { text: 'We must follow the rules of the library.', zh: '我们必须遵守图书馆的规则。' },
    { text: 'The Great Wall is a wonder of the world.', zh: '长城是世界一大奇迹。' },
    { text: 'My family always supports my dreams.', zh: '我的家人总是支持我的梦想。' },
    { text: 'Hard work brings great achievement.', zh: '努力会带来伟大的成就。' },
    { text: 'Everyone should be a responsible citizen.', zh: '每个人都应当成为负责任的公民。' },
    { text: 'Climate change is a global challenge.', zh: '气候变化是一个全球性挑战。' },
    { text: 'Reading Chinese literature widens our mind.', zh: '阅读中国文学能开阔我们的思维。' },
    { text: 'We live in harmony with nature.', zh: '我们与自然和谐共处。' },
    { text: 'Perseverance leads to success in the end.', zh: '毅力最终会通向成功。' },
    { text: 'Artificial intelligence is changing the world.', zh: '人工智能正在改变世界。' },
    { text: 'Reading is a lifelong habit.', zh: '阅读是一种终身的习惯。' },
    { text: 'Everyone can make a contribution.', zh: '每个人都能做出贡献。' },
    { text: 'We are grateful for the help from others.', zh: '我们感激他人的帮助。' },
  ],

  /* ---------- 口语句库 ---------- */
  speakingPool: [
    { text: 'Hello! My name is Lily.', trans: '你好！我的名字叫莉莉。', tip: '自我介绍开场' },
    { text: 'Nice to meet you!', trans: '很高兴认识你！', tip: '初次见面问候 · 语调上扬' },
    { text: 'Thank you very much.', trans: '非常感谢你。', tip: '感谢用语 · 重音在 Thank' },
    { text: 'What is this in English?', trans: '这个用英语怎么说？', tip: '课堂提问常用句' },
    { text: 'I like apples very much.', trans: '我非常喜欢苹果。', tip: '表达喜好 · like + 名词' },
    { text: 'Can you help me, please?', trans: '你能帮帮我吗？', tip: '礼貌求助 · please 结尾' },
    { text: 'What day is it today?', trans: '今天星期几？', tip: '询问日期 · 一般现在时' },
    { text: 'It is sunny today. Let us play outside.', trans: '今天天气晴朗，我们去外面玩吧。', tip: '提建议 · Let us + 动词原形' },
    { text: 'How is the weather today?', trans: '今天天气怎么样？', tip: '谈论天气 · 高频句型' },
    { text: 'I usually get up at seven.', trans: '我通常七点起床。', tip: '描述习惯 · 频率副词' },
    { text: 'What is your favourite subject?', trans: '你最喜欢的科目是什么？', tip: '询问喜好 · favourite' },
    { text: 'There is a library near my home.', trans: '我家附近有一个图书馆。', tip: 'There be 句型 · 单数用 is' },
    { text: 'I would like some noodles, please.', trans: '我想要一些面条。', tip: '点餐用语 · would like' },
    { text: 'How do you go to school?', trans: '你怎么去上学？', tip: '询问交通方式' },
    { text: 'It takes me twenty minutes to get there.', trans: '到那里花了我二十分钟。', tip: 'It takes 句型' },
    { text: 'I am going to visit my grandparents.', trans: '我打算去看望我的祖父母。', tip: 'be going to 表打算' },
    { text: 'Could you tell me the way to the museum?', trans: '你能告诉我去博物馆的路吗？', tip: '礼貌问路 · Could you' },
    { text: 'I am looking forward to the summer holiday.', trans: '我期待着暑假。', tip: 'look forward to + 名词' },
    { text: 'I think English is very interesting.', trans: '我认为英语很有趣。', tip: '表达观点 · I think' },
    { text: 'My dream is to travel around the world.', trans: '我的梦想是环游世界。', tip: '表达梦想 · 不定式作表语' },
    { text: 'We should protect our environment.', trans: '我们应该保护环境。', tip: '提出建议 · should + 动词原形' },
    { text: 'Practice makes perfect.', trans: '熟能生巧。', tip: '谚语 · 连读注意' },
    { text: 'I will try my best to achieve my goal.', trans: '我会尽全力实现我的目标。', tip: '表决心 · try ones best' },
    { text: 'Never give up, and you will succeed.', trans: '永不放弃，你就会成功。', tip: '励志表达 · 祈使句 + and' },
    { text: 'Knowledge is power. Keep learning every day.', trans: '知识就是力量，每天坚持学习。', tip: '名言引用 · 注意节奏' },
    { text: 'I think technology makes life more convenient.', trans: '我认为科技让生活更方便。', tip: '表达观点 · I think' },
    { text: 'We should share our things with friends.', trans: '我们应该和朋友分享东西。', tip: 'should + 动词原形' },
    { text: 'My goal is to speak English well.', trans: '我的目标是说好英语。', tip: '表达目标 · 名词作表语' },
    { text: 'Volunteering makes me happy.', trans: '做志愿者让我快乐。', tip: 'make + 宾语 + 形容词' },
    { text: 'Let us keep our classroom bright and clean.', trans: '让我们保持教室明亮整洁。', tip: 'Let us + 动词原形' },
    { text: 'Can you describe your best friend?', trans: '你能描述一下你最好的朋友吗？', tip: '请求描述 · describe' },
    { text: 'We should love the natural world.', trans: '我们应该热爱大自然。', tip: 'should + 动词原形' },
    { text: 'This is a good method to study English.', trans: '这是一个学英语的好方法。', tip: 'a method to do' },
    { text: 'I want to be an inventor in the future.', trans: '我将来想成为一名发明家。', tip: 'want to be + 职业' },
    { text: 'Science shows us the force of nature.', trans: '科学向我们展示自然的力量。', tip: '主谓双宾' },
    { text: 'It is our duty to protect the environment.', trans: '保护环境是我们的责任。', tip: 'It is + 名词 + to do' },
    { text: 'Innovation drives the progress of society.', trans: '创新推动社会进步。', tip: '主谓宾结构' },
    { text: 'Old people have great wisdom.', trans: '老年人拥有大智慧。', tip: 'have + 名词' },
    { text: 'We face global challenges together.', trans: '我们共同面对全球挑战。', tip: '范围/频度副词' },
    { text: 'The spirit of helping others is beautiful.', trans: '助人的精神是美好的。', tip: '名词所有格' },
    { text: 'He has a big ambition to change the world.', trans: '他有很大的抱负去改变世界。', tip: 'ambition to do' },
    { text: 'Study broadens your horizon.', trans: '学习拓宽你的视野。', tip: '主谓宾 + 宾语' },
    { text: 'We should keep learning for life.', trans: '我们应该终身学习。', tip: 'keep doing' },
    { text: 'Science needs breakthroughs to move on.', trans: '科学需要突破才能前进。', tip: 'need + 名词' },
    { text: 'Work gives people dignity and pride.', trans: '工作给人尊严与自豪。', tip: 'give + 双宾' },
  ],

  DAILY_WORDS: 10,
  DAILY_LISTEN: 5,
  DAILY_SPEAK: 5,

  /* ---------- 教材自动同步（启动时检查版本） ---------- */
  checkCurriculumSync() {
    const saved = DB.get('study_curriculum_meta', null);
    const current = this.curriculumMeta;
    if (!saved) {
      // 首次访问
      DB.set('study_curriculum_meta', { ...current, firstInstalled: DB.todayKey() });
      return { status: 'first', meta: current };
    }
    if (saved.version !== current.version) {
      // 版本变化 → 标记待同步
      DB.set('study_curriculum_meta', { ...current, upgradedAt: DB.todayKey(), oldVersion: saved.version });
      return { status: 'upgraded', meta: current, oldVersion: saved.version };
    }
    // 同版本：仅更新最近同步日期
    DB.set('study_curriculum_meta', { ...saved, lastSyncDate: DB.todayKey() });
    return { status: 'current', meta: saved };
  },

  /* ---------- 学习进度核心 ---------- */
  startDate() {
    let s = DB.get('study_start_date');
    if (!s) {
      s = DB.todayKey();
      DB.set('study_start_date', s);
    }
    return s;
  },

  dayIndex() {
    const start = new Date(this.startDate() + 'T00:00:00');
    const now = new Date(DB.todayKey() + 'T00:00:00');
    return Math.max(0, Math.floor((now - start) / 86400000));
  },

  todayWords() {
    return this.batchFor('study_word_batch', this.buildPool(), this.DAILY_WORDS, 'word', 'study_word_done');
  },

  todayStage() {
    const w = this.todayWords();
    if (w.length) return w[0].stage;
    if (this.todayListen().length) return '（听力）进行中';
    if (this.todaySpeak().length) return '（口语）进行中';
    return '全部完成 🎉';
  },

  // 通用批次：从"未做过的"项目里按年级顺序取 daily 个；同一天稳定不重排
  // 做过的不再出现；池做遍后自然进入下一册（不轮转）；全部做完返回空
  batchFor(prefix, pool, daily, idKey, doneKey) {
    const key = prefix + '_batch';
    const today = DB.todayKey();
    let batch = DB.get(key, null);
    const doneSet = new Set(DB.get(doneKey, []).map(r => r[idKey]));
    if (!batch || batch.date !== today) {
      const remaining = pool.filter(x => !doneSet.has(x[idKey]));
      batch = { date: today, ids: remaining.slice(0, daily).map(x => x[idKey]) };
      DB.set(key, batch);
    }
    return batch.ids.map(id => pool.find(x => x[idKey] === id)).filter(Boolean);
  },

  todayListen() {
    return this.batchFor('study_listen_batch', this.listeningPool, this.DAILY_LISTEN, 'text', 'study_listen_done');
  },

  todaySpeak() {
    return this.batchFor('study_speak_batch', this.speakingPool, this.DAILY_SPEAK, 'text', 'study_speak_done');
  },

  doneWordsSet() {
    return new Set(DB.get('study_word_done', []).map(r => r.word));
  },

  wrongMap() {
    const m = {};
    DB.get('study_word_wrong', []).forEach(x => { m[x.word] = x.count || 0; });
    return m;
  },

  reviewWords() {
    const wrongs = this.wrongMap();
    const done = this.doneWordsSet();
    return this.buildPool().filter(w => wrongs[w.word] >= 2 && !done.has(w.word));
  },

  todayListenDone() {
    const today = DB.todayKey();
    return new Set(DB.filterByDate('study_listen_done', today).map(r => r.text));
  },

  todaySpeakDone() {
    const today = DB.todayKey();
    return new Set(DB.filterByDate('study_speak_done', today).map(r => r.text));
  },

  // 历史已做集合（跨天），用于"不重复已做"筛选
  listenHistoryDone() {
    return new Set(DB.get('study_listen_done', []).map(r => r.text));
  },

  speakHistoryDone() {
    return new Set(DB.get('study_speak_done', []).map(r => r.text));
  },

  streakDays() {
    const dates = new Set([
      ...DB.get('study_word_done', []).map(r => r.date),
      ...DB.get('study_listen_done', []).map(r => r.date),
      ...DB.get('study_speak_done', []).map(r => r.date),
    ]);
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },

  /* ---------- 页面 ---------- */
  mount(container) {
    // 教材自动同步检查
    const syncResult = this.checkCurriculumSync();
    if (syncResult.status === 'upgraded') {
      Utils.toast(`教材已升级到 ${syncResult.meta.version} 🎉`, 'success');
    }

    const today = DB.todayKey();
    const words = this.todayWords();
    const doneSet = this.doneWordsSet();
    const wordDoneToday = words.filter(w => doneSet.has(w.word)).length;
    const listenDone = this.todayListenDone().size;
    const speakDone = this.todaySpeakDone().size;
    const reviews = this.reviewWords();
    const books = DB.get('study_books', []);
    const readingStats = this.readingStats();
    const dayNo = this.dayIndex() + 1;
    const stage = this.todayStage();
    const meta = this.curriculumMeta;

    const wordAllDone = wordDoneToday >= this.DAILY_WORDS;
    const listenAllDone = listenDone >= this.DAILY_LISTEN;
    const speakAllDone = speakDone >= this.DAILY_SPEAK;

    container.innerHTML = `
      <div class="page">
        ${Components.banner({
          module: 'study',
          title: '学习收获',
          sub: `第 ${dayNo} 天 · ${stage}`,
          actions: `
            <span class="tag tag-pink" style="margin-left:0">🔥 连续 ${this.streakDays()} 天</span>
            <span class="tag btn-soft">📚 ${meta.version}</span>
          `
        })}

        <div class="kitty-feature-card" style="margin-bottom:16px">
          <div class="kitty-portrait" style="background:linear-gradient(135deg,#d9e2f3,#ffd7c3)">${Utils.kittyImg({ size: 'small', module: 'study' })}</div>
          <div class="lfc-text">
            <div class="lfc-title">${this.streakDays() >= 7 ? '🌟 太厉害啦！' : this.streakDays() > 0 ? '📖 继续加油哦～' : '📖 开始今天的学习吧～'}</div>
            <div class="lfc-sub">每天 10 新词 + 5 听力 + 5 口语，答错 2 次自动进复习，从三年级到初三按教材年级循序渐进～</div>
          </div>
        </div>

        <div class="card mb-16" style="background:linear-gradient(135deg, rgba(255,236,247,0.6), rgba(255,225,232,0.4))">
          <div class="flex-between mb-8">
            <div class="card-title" style="margin:0">
              <span class="card-title-ico">📘</span>教材自动同步
            </div>
            <span class="tag tag-pink" style="font-size:11px">🔄 ${syncResult.status === 'upgraded' ? '已升级' : syncResult.status === 'first' ? '已安装' : '最新'}</span>
          </div>
          <div class="text-sm text-secondary" style="line-height:1.7">
            <div>📖 <strong>${Utils.esc(meta.edition)}</strong></div>
            <div>🏷️ 版本：<strong>${Utils.esc(meta.version)}</strong> · 共 ${meta.totalStages} 册 · ${meta.wordsPerStage * meta.totalStages} 词</div>
            <div>📅 同步日期：<strong>${Utils.esc(meta.lastSyncDate)}</strong></div>
            ${syncResult.status === 'upgraded' ? `<div class="mt-4" style="color:#c2185b">⬆️ 从 ${Utils.esc(syncResult.oldVersion)} 升级到 ${Utils.esc(meta.version)}</div>` : ''}
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">📊</span>学习统计
            </div>
            <div class="tag tag-pink">🔥 连续 ${this.streakDays()} 天</div>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-item">
              <div class="stat-bar-num">${DB.get('study_word_done', []).length}</div>
              <div class="stat-bar-label">累计掌握</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num" style="color:#e8919f">${reviews.length}</div>
              <div class="stat-bar-label">待复习</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num">${wordDoneToday}/${this.DAILY_WORDS}</div>
              <div class="stat-bar-label">今日单词</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num">${listenDone}/${this.DAILY_LISTEN}</div>
              <div class="stat-bar-label">今日听力</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num">${speakDone}/${this.DAILY_SPEAK}</div>
              <div class="stat-bar-label">今日口语</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num">${DB.get('study_listen_done', []).length + DB.get('study_speak_done', []).length}</div>
              <div class="stat-bar-label">听说累计</div>
            </div>
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">🌸</span>今日英语任务
              <span class="tag tag-pink" style="margin-left:8px">${stage}</span>
            </div>
            <div class="text-sm text-muted">第 ${dayNo} 天</div>
          </div>

          <div class="english-grid">
            <div class="english-tile ${this.state.tab === 'word' ? 'active' : ''}" data-stab="word">
              <div class="tile-ico">📝</div>
              <div class="tile-label">每日单词 ×${this.DAILY_WORDS}</div>
              <div class="tile-sub">${wordAllDone ? '✓ 已完成' : wordDoneToday + '/' + this.DAILY_WORDS}</div>
            </div>
            <div class="english-tile ${this.state.tab === 'listen' ? 'active' : ''}" data-stab="listen">
              <div class="tile-ico">🎧</div>
              <div class="tile-label">每日听力 ×${this.DAILY_LISTEN}</div>
              <div class="tile-sub">${listenAllDone ? '✓ 已完成' : listenDone + '/' + this.DAILY_LISTEN}</div>
            </div>
            <div class="english-tile ${this.state.tab === 'speak' ? 'active' : ''}" data-stab="speak">
              <div class="tile-ico">🎤</div>
              <div class="tile-label">每日口语 ×${this.DAILY_SPEAK}</div>
              <div class="tile-sub">${speakAllDone ? '✓ 已完成' : speakDone + '/' + this.DAILY_SPEAK}</div>
            </div>
            ${reviews.length ? `
            <div class="english-tile ${this.state.tab === 'review' ? 'active' : ''}" data-stab="review">
              <div class="tile-ico">🔁</div>
              <div class="tile-label">待复习词库</div>
              <div class="tile-sub">${reviews.length} 个单词</div>
            </div>` : ''}
          </div>

          <div id="english-panel"></div>

          <div class="mt-16 mb-8 text-sm text-secondary font-medium">兼容英语软件</div>
          <div class="app-row">
            <a class="app-tile" href="momo://" target="_blank" rel="noopener">
              <span class="app-ico">🪺</span>
              <span class="app-name">墨墨背单词</span>
              <span class="app-sub">一键打开</span>
            </a>
            <a class="app-tile" href="kekenet://" target="_blank" rel="noopener">
              <span class="app-ico">🦉</span>
              <span class="app-name">可可英语</span>
              <span class="app-sub">跳转 APP</span>
            </a>
            <a class="app-tile" href="duolingo://" target="_blank" rel="noopener">
              <span class="app-ico">🦉</span>
              <span class="app-name">Duolingo</span>
              <span class="app-sub">跳转 APP</span>
            </a>
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">📖</span>看书打卡
            </div>
            <button class="btn-ghost btn-primary text-sm" id="study-book-add">+ 添加书籍</button>
          </div>
          <div id="study-books-list">
            ${books.length ? books.map((b, i) => this.renderBook(b, i)).join('') : Components.empty({ icon: '📚', title: '还没有添加书籍', sub: '点击右上角添加你想读的书籍', hero: true })}
          </div>
          ${books.length ? `
            <div class="card-grid-3 mt-16">
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.todayMinutes}</div>
                <div class="text-sm text-muted">今日分钟</div>
              </div>
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.weekDays}</div>
                <div class="text-sm text-muted">本周天数</div>
              </div>
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.totalMinutes}</div>
                <div class="text-sm text-muted">累计分钟</div>
              </div>
            </div>
          ` : ''}
        </div>

        <div style="text-align:center;padding:16px;font-size:11px;color:var(--text-muted)">
          每日 10 新词 · 5 句听力 · 5 句口语 · 做过的不再出现 · 答错 2 次自动进入待复习词库 🌸
        </div>
      </div>
    `;

    this.renderEnglishPanel();
    this.bindEvents();
  },

  /* ---------- 今日任务面板 ---------- */
  renderEnglishPanel() {
    const el = document.getElementById('english-panel');
    if (!el) return;
    const tab = this.state.tab;

    if (tab === 'word') {
      const words = this.todayWords();
      const doneSet = this.doneWordsSet();
      const wrongs = this.wrongMap();
      el.innerHTML = `
        <div class="english-panel">
          <div class="flex-between mb-8">
            <div class="card-title"><span class="card-title-ico">📝</span>今日新词（点击卡片 → 选答案 → 确认）</div>
            <div class="text-sm text-muted">${words.filter(w => doneSet.has(w.word)).length}/${this.DAILY_WORDS} 已掌握</div>
          </div>
          <div class="word-list">
            ${words.map((w, i) => {
              const done = doneSet.has(w.word);
              const inReview = wrongs[w.word] >= 2 && !done;
              return `
                <div class="word-chip ${done ? 'done' : ''} ${inReview ? 'review' : ''}" data-quiz="${i}">
                  <span class="word-chip-en">${Utils.esc(w.word)}</span>
                  <span class="word-chip-status">${done ? '✓' : (inReview ? '🔁' : i + 1)}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="text-sm text-muted mt-8" style="font-size:11px">✓ 已掌握 · 🔁 待复习 · 数字 未学习 · 单击卡片开始答题</div>
        </div>
      `;
      this.bindQuiz();
    } else if (tab === 'listen') {
      const sentences = this.todayListen();
      const doneSet = this.todayListenDone();
      el.innerHTML = `
        <div class="english-panel">
          <div class="card-title mb-8"><span class="card-title-ico">🎧</span>今日听力 · 5 题（先盲听 → 选答案 → 确认）</div>
          ${sentences.map((s, i) => `
            <div class="listen-row ${doneSet.has(s.text) ? 'done' : ''}">
              <div class="listen-num">${i + 1}</div>
              <button class="audio-btn" data-listen-play="${i}" title="播放音频">▶</button>
              <div class="listen-content">
                <div class="listen-text">${doneSet.has(s.text) ? Utils.esc(s.text) : '🔊 点击 ▶ 听音频'}</div>
                <div class="listen-zh" data-listen-zh="${i}" style="display:${doneSet.has(s.text) ? 'block' : 'none'}">${Utils.esc(s.zh)}</div>
              </div>
              <button class="checkin-btn ${doneSet.has(s.text) ? 'btn-pink btn-primary' : 'btn-ghost btn-primary'}" data-listen-done="${i}">
                ${doneSet.has(s.text) ? '✓ 已完成' : '完成'}
              </button>
            </div>
          `).join('')}
          <div class="text-sm text-muted mt-8" style="font-size:11px">先点 ▶ 盲听，根据听到的句子选最贴切的中文意思，答对自动标记完成</div>
        </div>
      `;
      this.bindListen();
    } else if (tab === 'speak') {
      const sentences = this.todaySpeak();
      const doneSet = this.todaySpeakDone();
      el.innerHTML = `
        <div class="english-panel">
          <div class="card-title mb-8"><span class="card-title-ico">🎤</span>今日口语 · 5 句（跟读并打卡）</div>
          ${sentences.map((s, i) => `
            <div class="speak-row ${doneSet.has(s.text) ? 'done' : ''}">
              <div class="speak-content">
                <div class="speak-text">"${Utils.esc(s.text)}"</div>
                <div class="speak-trans">${Utils.esc(s.trans)}</div>
                <div class="speak-tip">💡 ${Utils.esc(s.tip)}</div>
              </div>
              <div class="speak-actions">
                <button class="btn-icon" title="示范朗读" data-speak-play="${i}">🔊</button>
                <button class="checkin-btn ${doneSet.has(s.text) ? 'btn-pink btn-primary' : 'btn-ghost btn-primary'}" data-speak-done="${i}">
                  ${doneSet.has(s.text) ? '✓ 已完成' : '跟读'}
                </button>
              </div>
            </div>
          `).join('')}
          <div class="text-sm text-muted mt-8" style="font-size:11px">点 🔊 听示范，大声朗读 3 遍后打卡</div>
        </div>
      `;
      this.bindSpeak();
    } else if (tab === 'review') {
      const reviews = this.reviewWords();
      el.innerHTML = `
        <div class="english-panel">
          <div class="card-title mb-8"><span class="card-title-ico">🔁</span>待复习词库（${reviews.length}）</div>
          ${reviews.length ? `
            <div class="word-list">
              ${reviews.map((w, i) => `
                <div class="word-chip review" data-review-quiz="${Utils.esc(w.word)}">
                  <span class="word-chip-en">${Utils.esc(w.word)}</span>
                  <span class="word-chip-status">🔁</span>
                </div>
              `).join('')}
            </div>
            <div class="text-sm text-muted mt-8" style="font-size:11px">这些词你答错了 2 次，复习答对即可移出词库</div>
          ` : Components.empty({ icon: '🎉', title: '太棒了，没有待复习单词！', sub: '继续保持每日学习节奏' })}
        </div>
      `;
      this.bindReview();
    }
  },

  /* ============================================================
     单词答题：选选项 → 状态切换 → 点「确认」→ 提交
     ============================================================ */
  openQuiz(word, isReview = false) {
    const pool = this.buildPool();
    const correct = word.meaning;
    // 生成 4 个选项
    const distract = pool.filter(w => w.meaning !== correct).map(w => w.meaning);
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(distract[Math.floor(Math.random() * distract.length)]);
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    const wrongs = DB.get('study_word_wrong', []);
    const rec = wrongs.find(x => x.word === word.word);
    const wrongCount = rec ? rec.count : 0;

    const m = Components.modal({
      title: isReview ? '🔁 复习模式' : '📝 单词小测验',
      body: `
        <div class="text-center mb-16">
          <div class="word-quiz-en">${Utils.esc(word.word)}</div>
          <div class="word-quiz-phonetic">${Utils.esc(word.phonetic)} <span class="word-pos">${Utils.esc(word.pos)}</span></div>
          <div class="text-sm text-muted mt-4">答错次数：${wrongCount} / 2 · 请选择正确释义</div>
        </div>
        <div id="quiz-options" data-correct="${Utils.esc(correct)}">
          ${shuffled.map((o, i) => `
            <button class="quiz-option" data-opt="${Utils.esc(o)}" data-idx="${i}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="quiz-option-text">${Utils.esc(o)}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-actions">
          <button class="btn-primary btn-block" id="quiz-confirm" disabled>✓ 确认答案</button>
        </div>
        <div id="quiz-feedback"></div>
      `,
    });

    const box = document.getElementById('quiz-options');
    if (!box) return;
    const correctAns = box.dataset.correct;
    const confirmBtn = document.getElementById('quiz-confirm');
    let selected = null;

    // 选选项
    box.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        box.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.dataset.opt;
        confirmBtn.disabled = false;
      });
    });

    // 确认提交
    confirmBtn.addEventListener('click', () => {
      if (!selected) return;
      confirmBtn.disabled = true;
      box.querySelectorAll('.quiz-option').forEach(b => b.classList.add('disabled'));

      const fb = document.getElementById('quiz-feedback');
      if (selected === correctAns) {
        // 答对：标记掌握
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
        });
        if (!this.doneWordsSet().has(word.word)) {
          DB.push('study_word_done', { word: word.word, date: DB.todayKey(), stage: word.stage });
        }
        // 复习答对 → 移出待复习
        DB.set('study_word_wrong', DB.get('study_word_wrong', []).filter(x => x.word !== word.word));
        if (fb) fb.innerHTML = `<div class="quiz-fb ok">🎉 答对了！${Utils.esc(word.word)} · ${Utils.esc(word.meaning)}<br><span style="font-size:12px">${Utils.esc(word.example)}<br>${Utils.esc(word.exampleZh)}</span></div>`;
        Utils.toast('答对了 🌸', 'success');
        confirmBtn.textContent = '✓ 已掌握，关闭';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.mount(document.getElementById('app-main'));
        };
      } else {
        // 答错：错误计数 +1
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
          if (b.dataset.opt === selected) b.classList.add('wrong');
        });
        const list = DB.get('study_word_wrong', []);
        const r = list.find(x => x.word === word.word);
        if (r) r.count = (r.count || 0) + 1;
        else list.push({ word: word.word, count: 1, date: DB.todayKey() });
        DB.set('study_word_wrong', list);
        const cnt = (r ? r.count : 1);
        if (fb) fb.innerHTML = `<div class="quiz-fb bad">${cnt >= 2 ? '🔁 已加入待复习词库' : '❌ 再想想，还剩 ' + (2 - cnt) + ' 次机会'}<br><span style="font-size:12px">正确答案：${Utils.esc(correctAns)}<br>${Utils.esc(word.example)}</span></div>`;
        if (cnt >= 2) Utils.toast('该词已进入待复习词库 🔁', 'warning');
        confirmBtn.textContent = '↻ 再练一次';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.mount(document.getElementById('app-main'));
        };
      }
    });
  },

  bindQuiz() {
    const words = this.todayWords();
    document.querySelectorAll('[data-quiz]').forEach(el => {
      el.addEventListener('click', () => this.openQuiz(words[parseInt(el.dataset.quiz)]));
    });
  },

  bindReview() {
    const pool = this.buildPool();
    document.querySelectorAll('[data-review-quiz]').forEach(el => {
      el.addEventListener('click', () => {
        const w = pool.find(x => x.word === el.dataset.reviewQuiz);
        if (w) this.openQuiz(w, true);
      });
    });
  },

  /* ============================================================
     听力：先听音频 → 4 选 1 → 点「确认」→ 答对显示原文
     ============================================================ */
  openListenQuiz(sentence, idx) {
    const pool = this.listeningPool;
    const correct = sentence.zh;
    // 4 个选项
    const distract = pool.filter(s => s.zh !== correct).map(s => s.zh);
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(distract[Math.floor(Math.random() * distract.length)]);
    const shuffled = [...opts].sort(() => Math.random() - 0.5);

    const m = Components.modal({
      title: '🎧 听力选择题',
      body: `
        <div class="text-center mb-16">
          <button class="audio-btn-lg" id="listen-modal-play">▶ 播放音频</button>
          <div class="text-sm text-muted mt-4">听英文句子，选出最贴切的中文意思</div>
        </div>
        <div id="listen-options" data-correct="${Utils.esc(correct)}" data-text="${Utils.esc(sentence.text)}">
          ${shuffled.map((o, i) => `
            <button class="quiz-option" data-opt="${Utils.esc(o)}" data-idx="${i}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="quiz-option-text">${Utils.esc(o)}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-actions">
          <button class="btn-primary btn-block" id="listen-confirm" disabled>✓ 确认答案</button>
        </div>
        <div id="listen-feedback"></div>
      `,
    });

    const box = document.getElementById('listen-options');
    const correctAns = box.dataset.correct;
    const englishText = box.dataset.text;
    const confirmBtn = document.getElementById('listen-confirm');
    let selected = null;

    // 播放音频
    document.getElementById('listen-modal-play').addEventListener('click', () => {
      this.speak(englishText, 0.85);
    });
    // 自动播放一次
    setTimeout(() => this.speak(englishText, 0.85), 300);

    // 选选项
    box.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        box.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.dataset.opt;
        confirmBtn.disabled = false;
      });
    });

    // 确认
    confirmBtn.addEventListener('click', () => {
      if (!selected) return;
      confirmBtn.disabled = true;
      box.querySelectorAll('.quiz-option').forEach(b => b.classList.add('disabled'));

      const fb = document.getElementById('listen-feedback');
      if (selected === correctAns) {
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
        });
        // 标记完成
        if (!this.todayListenDone().has(englishText)) {
          DB.push('study_listen_done', { text: englishText, date: DB.todayKey() });
        }
        if (fb) fb.innerHTML = `<div class="quiz-fb ok">🎉 答对了！<br><span style="font-size:13px;font-weight:500">"${Utils.esc(englishText)}"</span><br><span style="font-size:12px">${Utils.esc(correctAns)}</span></div>`;
        Utils.toast('听力答对 🎧', 'success');
        confirmBtn.textContent = '✓ 已掌握，关闭';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.mount(document.getElementById('app-main'));
        };
      } else {
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
          if (b.dataset.opt === selected) b.classList.add('wrong');
        });
        if (fb) fb.innerHTML = `<div class="quiz-fb bad">❌ 答错了<br><span style="font-size:12px">正确答案：${Utils.esc(correctAns)}<br>原句："${Utils.esc(englishText)}"</span></div>`;
        Utils.toast('再听一次 🎧', 'warning');
        confirmBtn.textContent = '↻ 再听一次';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.openListenQuiz(sentence, idx);
        };
      }
    });
  },

  /* ---------- 听力事件绑定 ---------- */
  bindListen() {
    const sentences = this.todayListen();
    document.querySelectorAll('[data-listen-play]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(b.dataset.listenPlay);
        const s = sentences[idx];
        this.speak(s.text, 0.85);
      });
    });
    document.querySelectorAll('[data-listen-done]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(b.dataset.listenDone);
        const s = sentences[idx];
        // 打开听力选择题 quiz
        this.openListenQuiz(s, idx);
      });
    });
  },

  /* ---------- 口语 ---------- */
  bindSpeak() {
    const sentences = this.todaySpeak();
    document.querySelectorAll('[data-speak-play]').forEach(b => {
      b.addEventListener('click', () => {
        const s = sentences[parseInt(b.dataset.speakPlay)];
        this.speak(s.text, 0.85);
        Utils.toast('示范朗读中 🔊');
      });
    });
    document.querySelectorAll('[data-speak-done]').forEach(b => {
      b.addEventListener('click', (e) => {
        const s = sentences[parseInt(b.dataset.speakDone)];
        const done = this.todaySpeakDone();
        if (done.has(s.text)) {
          const rec = DB.filterByDate('study_speak_done', DB.todayKey()).find(r => r.text === s.text);
          if (rec) DB.removeById('study_speak_done', rec._id);
          Utils.toast('已取消');
        } else {
          DB.push('study_speak_done', { text: s.text, date: DB.todayKey() });
          Utils.toast('跟读完成 🎤', 'success');
          Utils.burst(e.target, ['🎤', '💖', '🌟']);
        }
        this.mount(document.getElementById('app-main'));
      });
    });
  },

  speak(text, rate = 0.85) {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        speechSynthesis.speak(u);
      } catch (e) {}
    } else {
      Utils.toast('当前浏览器不支持语音朗读', 'warning');
    }
  },

  renderBook(b, i) {
    const coverCls = `book-cover-${(i % 6) + 1}`;
    const status = b.done ? 'done' : (b.progress > 0 ? 'reading' : '');
    const statusText = b.done ? '已读完' : (b.progress > 0 ? '继续阅读' : '开始阅读');
    return `
      <div class="book-row slide-up" style="animation-delay:${i * 0.05}s" data-book="${b._id}">
        <div class="book-cover ${coverCls}">${(b.title || '?')[0]}</div>
        <div class="book-info">
          <div class="book-title">${Utils.esc(b.title)}</div>
          <div class="book-author">${Utils.esc(b.author || '佚名')} ${b.progress ? `· 第 ${b.progress} 页` : ''}</div>
          ${b.progress > 0 ? `
            <div class="book-progress"><div class="book-progress-fill" style="width:${Math.min(100, b.progress / (b.totalPages || b.progress) * 100)}%"></div></div>
          ` : ''}
        </div>
        <button class="book-status ${status}" data-book-action="${b._id}">${statusText}</button>
      </div>
    `;
  },

  bindEvents() {
    const root = document.getElementById('app-main');

    // tab 切换
    root.querySelectorAll('[data-stab]').forEach(b => {
      b.addEventListener('click', () => {
        this.state.tab = b.dataset.stab;
        this.mount(root);
      });
    });

    // 添加书籍
    document.getElementById('study-book-add')?.addEventListener('click', async () => {
      const r = await Components.form({
        title: '添加一本想读的书',
        fields: [
          { key: 'title', label: '书名', placeholder: '例如：小王子', required: true },
          { key: 'author', label: '作者', placeholder: '圣埃克苏佩里' },
          { key: 'progress', label: '当前页数', type: 'number', placeholder: '0' },
          { key: 'totalPages', label: '总页数', type: 'number', placeholder: '200' },
        ],
        okText: '添加',
      });
      if (r && r.title) {
        const books = DB.get('study_books', []);
        books.push({
          _id: Utils.uid(),
          title: r.title,
          author: r.author || '',
          progress: parseInt(r.progress) || 0,
          totalPages: parseInt(r.totalPages) || 0,
          done: false,
          addedAt: new Date().toISOString(),
        });
        DB.set('study_books', books);
        Utils.toast('已添加书籍 📖', 'success');
        this.mount(root);
      }
    });

    // 书籍操作
    root.querySelectorAll('[data-book-action]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.bookAction;
        const books = DB.get('study_books', []);
        const book = books.find(x => x._id === id);
        if (!book) return;
        if (book.done) {
          const ok = await Components.confirm({ title: '重新阅读', message: '标记为未读完并继续阅读？' });
          if (ok) {
            book.done = false;
            DB.set('study_books', books);
            this.mount(root);
          }
          return;
        }
        const r = await Components.form({
          title: `打卡 · ${book.title}`,
          fields: [
            { key: 'minutes', label: '阅读时长（分钟）', type: 'number', value: 30, required: true },
            { key: 'progress', label: '当前页数', type: 'number', value: (book.progress || 0) + 10 },
            { key: 'note', label: '读书笔记 / 感悟', type: 'textarea', placeholder: '今天读到的内容...' },
          ],
          okText: '完成打卡 ✓',
        });
        if (r) {
          const minutes = parseInt(r.minutes) || 0;
          const newProgress = parseInt(r.progress) || 0;
          book.progress = newProgress;
          if (book.totalPages && newProgress >= book.totalPages) {
            book.done = true;
          }
          DB.push('study_checkin', {
            bookId: id,
            bookTitle: book.title,
            minutes,
            progress: newProgress,
            note: r.note || '',
            date: DB.todayKey(),
          });
          DB.set('study_books', books);
          Utils.toast('打卡成功 📖', 'success');
          this.mount(root);
        }
      });
    });
  },

  readingStats() {
    const today = DB.todayKey();
    const records = DB.get('study_checkin', []);
    const todayRecs = records.filter(r => r.date === today);
    const todayMinutes = todayRecs.reduce((s, r) => s + (r.minutes || 0), 0);
    const weekDays = [...new Set(records.filter(r => {
      const d = new Date(r.date);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff < 7;
    }).map(r => r.date))].length;
    const totalMinutes = records.reduce((s, r) => s + (r.minutes || 0), 0);
    return { todayMinutes, weekDays, totalMinutes };
  },
};

window.Study = Study;
