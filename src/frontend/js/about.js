
// const users = [
//   {
//     id: 'AmroImg',
//     imgSrcs: ['../assets/images/literallyAmro.gif', '../assets/images/againAmro.gif', '../assets/images/amro_actual.gif']
//   },
//   {
//     id: 'OmarImg',
//     imgSrcs: ['../assets/images/omar.gif', '../assets/images/amro.gif', '../assets/images/PONG.svg']
//   },
//   {
//     id: 'AikrImg',
//     imgSrcs: ['../assets/images/racoon.gif', '../assets/images/aikm.gif', '../assets/images/aikm3.gif']
//   },
//   {
//     id: 'YkulImg',
//     imgSrcs: ['../assets/images/yash.gif', '../assets/images/yash.gif', '../assets/images/yash.gif']
//   },
//   {
//     id: 'MasrImg',
//     imgSrcs: ['../assets/images/masr.gif', '../assets/images/masr.gif', '../assets/images/masr.gif']
//   }
// ];

// let currentIndex = 0;

// setInterval(() => {
//   users.forEach((user) => {
//     const imgElement = document.getElementById(user.id);
//     imgElement.src = user.imgSrcs[currentIndex];
//   });
//   currentIndex = (currentIndex + 1) % users[0].imgSrcs.length;
// }, 5000);


export async function aboutPage() {
  const users = [
    {
      id: 'AmroImg',
      imgSrcs: ['../assets/images/amro1.gif', '../assets/images/amro2.gif', '../assets/images/amro3.gif', '../assets/images/amro4.gif', '../assets/images/amro5.gif', '../assets/images/amro6.gif', '../assets/images/amro7.gif']
    },
    {
      id: 'OmarImg',
      imgSrcs: ['../assets/images/omar1.gif', '../assets/images/omar2.gif', '../assets/images/omar3.gif', '../assets/images/omar4.gif', '../assets/images/omar5.gif', '../assets/images/omar6.gif', '../assets/images/omar7.gif']
    },
    {
      id: 'AikrImg',
      imgSrcs: ['../assets/images/aikram1.gif', '../assets/images/aikram2.gif', '../assets/images/aikram3.gif', '../assets/images/aikram4.gif', '../assets/images/aikram5.gif', '../assets/images/aikram6.gif', '../assets/images/aikram7.gif', '../assets/images/aikram8.gif', '../assets/images/aikram9.gif']
    },
    {
      id: 'YkulImg',
      imgSrcs: ['../assets/images/yash1.gif', '../assets/images/yash2.gif', '../assets/images/yash3.gif', '../assets/images/yash4.gif', '../assets/images/yash5.gif', '../assets/images/yash6.gif', '../assets/images/yash7.gif']
    },
    {
      id: 'MasrImg',
      imgSrcs: ['../assets/images/masr1.gif', '../assets/images/masr2.gif', '../assets/images/masr3.gif', '../assets/images/masr4.gif', '../assets/images/masr5.gif', '../assets/images/masr6.gif', '../assets/images/masr7.gif']
    }
  ];

  let currentIndex = 0;

  const intervalId = setInterval(() => {
    users.forEach((user) => {
      const imgElement = document.getElementById(user.id);
      if (imgElement) {
        imgElement.src = user.imgSrcs[currentIndex];
      }
    });
    currentIndex = (currentIndex + 1) % users[0].imgSrcs.length;
  }, 5000);

  window.addEventListener('popstate', () => {
    clearInterval(intervalId);
  });
}