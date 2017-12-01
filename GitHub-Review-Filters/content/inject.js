
(function ($) {
  window.$ = $;  
  function GhHelper() {
    var self = this;
    self.$wrapper = $('body');
    self.$header = $('.Header');
    self.$content = $('.container');
    self.$wrapper.addClass('gh-helper');

    self.addMainLink = function (fn, label) {
      $('<li class="header-nav-item"><a>' + label + '</a></li>')
      .click(function () {
        self[fn]();
      })
      .appendTo(self.$ghHelperNavUlMain);
    };

    self.addToggleLink = function (type) {
      var label = (self.isPulls ? '' : '.') + type;
      $('<li class="header-nav-item toggleLink selected"><a>' + label + ' (' + self.itemTypes[type].length + ')</a></li>')
      .click(function () {
        if (self.typeIsVisible[type]) {
          self.itemTypes[type].forEach(function (item) {
            if (self.isPulls) {
              item.parent().parent().parent().parent().hide();
            } else {
              item.parent().hide();
            }
          });
          self.typeIsVisible[type] = false;
          $(this).removeClass('selected');
        } else {
          self.itemTypes[type].forEach(function (item) {
            if (self.isPulls) {
              item.parent().parent().parent().parent().show();
            } else {
              item.parent().show();
            }
          });
          self.typeIsVisible[type] = true;
          $(this).addClass('selected');
        }
      })
      .appendTo(self.$ghHelperNavUlItems);
    };
    

    self.addDivider = function () {
      $('<div class="divider-vertical"></div>')
      .appendTo(self.$ghHelperNavUlItems);
    };

    self.showAll = function () {
      $(self.$allItems).parent().show();
      Object.keys(self.typeIsVisible).forEach(function (type) {
        self.typeIsVisible[type] = true;
      });
      self.$ghHelperNavUlItems.find('li.toggleLink').addClass('selected');
    };

    self.hideAll = function () {
      $(self.$allItems).parent().hide();
      Object.keys(self.typeIsVisible).forEach(function (type) {
        self.typeIsVisible[type] = false;
      });
      self.$ghHelperNavUlItems.find('li.toggleLink').removeClass('selected');
    };

    self.init = function () {
      var pathname = window.location.pathname.split('/');
      self.isEnterprise = $('body').hasClass('enterprise');
      self.isPulls = pathname[3] === 'pulls';
      self.itemTypes = {};
      self.searchStr = 'div.meta[data-path]';
      self.typeIsVisible = {};
      self.$header.after('<div id="ghHelperNav" class="' + self.$header.attr('class') + '"><div class="container clearfix"><ul class="header-nav main"></ul><div class="divider-vertical"></div><ul class="header-nav items"></ul></div></div>');
      self.$ghHelper = $('.gh-helper');
      self.$ghHelperNav = $('#ghHelperNav');
      self.$ghHelperNavUlMain = self.$ghHelperNav.find('div > ul.header-nav.main');
      self.$ghHelperNavUlItems = self.$ghHelperNav.find('div > ul.header-nav.items');      
      self.addMainLink('showAll', 'Show All');
      self.addMainLink('hideAll', 'Hide All');
      self.update();
      $('body').on('click', 'a.js-pull-request-tab', function updateClick() {
        self.update();
      });
      $('body').on('click', 'a.issue-title-link', function updateClick() {
        self.update();
      });
      $('body').on('DOMNodeInserted', function (e) {              
        if (!!e.target.className && (e.target.className.indexOf('js-diff-progressive-container') >= 0)) {
          window.clearTimeout(self.updateTimeout);
          self.updateTimeout = window.setTimeout(function(){
            self.update();
          }, 1000);
          
        }
      });
    };  

    self.update = function () {
      console.log('updating');
      var pathname = window.location.pathname.split('/');
      self.isEnterprise = $('body').hasClass('enterprise');
      self.isPulls = pathname[3] === 'pulls' || pathname[3] === 'issues';
      self.itemTypes = {};
      self.searchStr = 'div[data-path]';
      self.allItemsSearchStr = 'div[data-path]';
      self.typeIsVisible = {};
      self.$ghHelperNavUlItems.find('li.toggleLink').remove();
      if (self.isPulls) {
        // List of pull requests grouped by user's github handle
        self.searchStr = '.opened-by > a';
        self.allItemsSearchStr = 'ul.table-list-issues > li.table-list-item > .issue-title';
      }
      self.$allItems = $(self.allItemsSearchStr);
      $(self.searchStr).each(function () {
        var itemType = self.isPulls ? $(this).text().trim() : $(this).attr('data-path').split('.').pop();
        if (!self.itemTypes.hasOwnProperty(itemType)) {
          self.itemTypes[itemType] = [];
        }
        self.typeIsVisible[itemType] = true;
        self.itemTypes[itemType].push($(this));
        //console.log($(this).parent(), $(this).data('path'));
      });
      var itemTypes = Object.keys(self.itemTypes);
      if (itemTypes.length) {
        itemTypes.forEach(function (itemType) {
          self.addToggleLink(itemType);
        });
        setTimeout(function () {
          self.$ghHelperNav.addClass('active');
        }, 400);
      } else {
        self.$ghHelperNav.removeClass('active overflow');
      }
    };

    self.init();

  }
  $(document).ready(function () {
    var ghHelper = new GhHelper();
    $(window).bind('popstate', function () {
      ghHelper.update();
    });
    ghHelper.update();
  });
}(jQuery));
