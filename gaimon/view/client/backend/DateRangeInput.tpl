<div class="dateRangeMenu">
    <div class="dateRange" rel="filterContainer">
        <div class="flex-column-center">
            <svg style="width:16px;height:16px;" viewBox="0 0 24 24">
                <path d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z" />
            </svg>
        </div>
        <div rel="filter"></div>
        <div class="flex-column-center">
            <svg style="width:16px;height:16px;" viewBox="0 0 24 24">
                <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
        </div>
    </div>
    <div class="date_range_context_menu hideMenuOnMobile" rel="filterContextMenu">
        <div class="chevron"></div>
        <div class="flex">
            <div class="contextMenuContainer">
                <div class="contextMenu" rel="today">Today</div>
                <div class="contextMenu" rel="yesterday">Yesterday</div>
                <div class="contextMenu" rel="lastSevenDays">Last 7 Days</div>
                <div class="contextMenu" rel="lastThirtyDays">Last 30 Days</div>
                <div class="contextMenu" rel="thisMonth">This Month</div>
                <div class="contextMenu" rel="lastMonth">Last Month</div>
                <div class="contextMenu" rel="thisYear">This Year</div>
                <div class="contextMenu" rel="lastYear">Last Year</div>
                <div class="contextMenu" rel="lastFiveYears">Last 5 Years</div>
                <div class="contextMenu" rel="customRange">Custom Range</div>
            </div>
            <div class="customRageContainer hidden" rel="customRageContainer">
                <div class="filter">
                    <label>Begin</label>
                    <input rel="start" type="date" />
                </div>
                <div class="filter">
                    <label>End</label>
                    <input rel="end" type="date" />
                </div>
            </div>
        </div>
    </div>
</div>