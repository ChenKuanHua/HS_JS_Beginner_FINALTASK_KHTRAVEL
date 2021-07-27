let data;
let area;
const areaSelect = document.querySelector(".areaSelect");
const listTitle = document.querySelector(".listTitle");
const filterList = document.querySelector(".filterList");
const btnList = document.querySelector(".hotList");
const loading = document.querySelector(".loading");
const pageList = document.querySelector(".pageList");
const perPage = 6;
let onePageData;

// 拿到全部資料
function getData(){
    const url = "https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json";
    // const url = "https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c";
    axios.get(url)
    .then(function(response){
        // data = JSON.parse(response.request.responseText).data.XML_Head.Infos.Info;
        data = JSON.parse(response.request.responseText).result.records;
        renderAreaSelect();
        console.log("拿到資料了");
        let str='';
        listTitle.textContent = "全部地區";
        // 製作按鈕
        makePageBtn(data,1);
        // 拿到第一頁的資料
        onePageData = getOnePageData(data,1);
        // 渲染畫面
        onePageData.forEach(item => {
            str += renderItem(item);
        });
        loading.style.display = "none";
        filterList.innerHTML = str;
    })
    .catch(function (error){
        console.log(error)
    })
}

// 吃一個data 吐一個區域
function getArea(item){
    let str = item.Add[3] + item.Add[4] + item.Add[5]; // 適用舊版 API
    // let str = item.Add[6] + item.Add[7] + item.Add[8]; // 適用新版 API
    return str;
}

// 將區域唯一值放進選單中
function renderAreaSelect(){
    let allArea = [];
    data.forEach(item => {
        allArea.push(getArea(item));
    })
    area = Array.from(new Set(allArea));  // 取出唯一值做成Array

    let str = `<option value="null" disabled selected> - -請選擇行政區- - </option>`
    area.forEach(item =>{
        str += `<option value="${item}">${item}</option>`
    })
    areaSelect.innerHTML = str;
}
// 根據給的地區，篩選出資料：按鈕和下拉選單用
function getList(e){
    let zone = e.target.value;
    if (e.target.nodeName === 'BUTTON' ){
        zone = e.target.textContent;
        let opts = areaSelect.options;
        for(let i = 0; i < opts.length; i++){
            if (opts[i].value === zone){
                opts[i].selected = true;
            };
        }
    };
    let str = "";
    // 如果有點到區域再執行
    if (zone) {
        console.log(zone);
        listTitle.textContent = zone;
        let filterData = [];
        // 拿到區域資料
        data.forEach(item => {
            if (getArea(item) === zone ) {
                filterData.push(item);
            };
        });
        // 製作分頁按鈕
        makePageBtn(filterData,1);
        // 渲染區域資料
        filterData.forEach(item => {
            str += renderItem(item);
        })
        filterList.innerHTML = str;
    };
}
// 吃一個data item，吐一個 html 內容 str 出來
function renderItem(item){
    let ticket;
    let ticketInfo;
    let str = "";
    let zone = getArea(item);
    if (item.Ticketinfo === "" ){
        ticket = "免費參觀";
        ticketInfo = "免費參觀";
    }else{
        ticket = "票券資訊";
        ticketInfo = item.Ticketinfo;
    }
    str = `<li class="filterItem">
                <div class="picArea text-white" style="background-image: url(${item.Picture1});">
                <h3 class="title">${item.Name}</h3><span class="title-span">${zone}</span>
                </div>
                <div class="detail position-relative">
                    <ul>
                        <li><img class="ml-1" src="images/icons_clock.png" alt="opentime"><span class="info">${item.Opentime}</span></li>
                        <li ><img class="ml-2" src="images/icons_pin.png" alt="address"><span class="info">${item.Add}</span></li>
                        <li><img class="ml-4" src="images/icons_phone.png" alt="tel"><span class="info">${item.Tel}</span></li>
                    </ul>
                    <span class="tag position-absolute">
                        <img class="tag-img" src="images/icons_tag.png" alt="tag">
                        <span title=${ticketInfo}>${ticket}</span>
                    </span>
                </div>
            </li>`
    return str;
}

// 分頁功能 1： 做分頁的全部按鈕
function makePageBtn(data, currentPage) {
    // 計算共需幾頁，就製作幾個按鈕
    const totalPage = Math.ceil(data.length / perPage);
    // console.log(`總共${data.length}筆資料，每頁${perPage}筆，共需${totalPage}個頁按鈕`);

    
    // 如果使用者一直按上一頁或下一頁，判斷是否有超過或小於總頁數
    let next = parseInt(currentPage) + 1;
    let prev = parseInt(currentPage) - 1;
    if (parseInt(currentPage) <= 1){ prev = 1};
    if (parseInt(currentPage) >= totalPage){next = totalPage};
    
    // 按鈕容器
    let str = '';

    // 上一頁按鈕
    str = `<li href="#" data-page="${prev}" data-curPage="${currentPage}"><i class="fas fa-long-arrow-alt-left"></i></li>`;
    // 中間的按鈕們
    for (let i=0; i<totalPage; i++) {
        str += `<li data-page=${i+1}>${i+1}</li>`;
    };
    // 下一頁按鈕
    str += `<li href="#" data-page="${next}" data-curPage="${currentPage}"><i class="fas fa-long-arrow-alt-right"></i></li>`;

    pageList.innerHTML = str;


    // 找到現在的頁數加入class名稱
    let li = pageList.children;
    Array.from(li).forEach(item => {
        if (item.dataset.page == currentPage){
            item.setAttribute('class','active');
        }
    });
}

// 分頁功能 2：拿到單一頁面的資料,返回資料 Array
function getOnePageData(data, goPage){
    let onePageData = [];
    // 計算資料在第幾筆開始：(現在頁數*每頁頁數) - 每頁頁數 + 1 (不是index)
    const startData = (goPage * perPage) - perPage + 1;
    // 計算資料在第幾筆結束：(現在頁數 * 每頁頁數)
    const endData = goPage * perPage;
    data.forEach((item,index) => {
        const count = index + 1;
        if (count >= startData && count <= endData) {
            onePageData.push(item);
        }
    })
    return onePageData;
}

// 整合分頁功能：當監聽到使用者按下第幾頁
// 把頁碼給分頁功能1去製作按鈕 和 給分頁功能2拿該頁面的資料
// 最後渲染出畫面
function changePage(e){
    if(e.target.nodeName !== 'LI') return;
    // console.log(e.target.nodeName)
    let filterData;
    let str = '';
    e.preventDefault();
    if (e.target.dataset.page) {
        if(e.target.dataset.page <= 0) return;
        // console.log(`點了 第${e.target.dataset.page}頁`);
        const page = e.target.dataset.page;
        // 製作按鈕
        makePageBtn(data, page);
        // 拿到資料
        filterData = getOnePageData(data, page);
        // 渲染資料
        filterData.forEach(item => {
            str += renderItem(item);
        })
        filterList.innerHTML = str;        
    }

}

//監聽分頁按鈕
pageList.addEventListener("click", changePage, false);
//監聽區域按鈕
btnList.addEventListener("click", getList, false)
//監聽區域選單
areaSelect.addEventListener("change", getList, false)

getData();
