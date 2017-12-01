(function ($) {  

  function GhHelper() {
    var self = this;
    self.$wrapper = $('body');
    self.$header = $('.Header');
    self.$content = $('.container');
    self.$wrapper.addClass('gh-helper');
    self.savedSettings = {};

    self.addMainLink = function (fn, label) {
      $('<li class="header-nav-item"><a>' + label + '</a></li>')
      .click(function () {
        self[fn]();
      })
      .appendTo(self.$ghHelperNavUlMain);
    };

    self.addToggleLink = function (type) {
      var label = '.' + type;    
      return $('<li class="header-nav-item toggleLink ' + (self.typeIsVisible[type]?'selected':'') + '"><a>' + label + ' (' + self.itemTypes[type].length + ')</a></li>')
      .click(function () {
        if (self.typeIsVisible[type]) {
          self.itemTypes[type].forEach(function (item) {            
              item.parent().hide();            
          });
          self.typeIsVisible[type] = false;
          $(this).removeClass('selected');
        } else {
          self.itemTypes[type].forEach(function (item) {            
              item.parent().show();            
          });
          self.typeIsVisible[type] = true;
          $(this).addClass('selected');
        }
        self.setSavedTypeIsVisible(type, self.typeIsVisible[type]);
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
      $('body').on('DOMNodeInserted', function (e) {              
        if (!!e.target.className && (e.target.className.indexOf('js-diff-progressive-container') >= 0 || e.target.className.indexOf('pagehead') >= 0)) {
          window.clearTimeout(self.updateTimeout);
          self.updateTimeout = window.setTimeout(function(){
            self.update();
          }, 500);
          
        }
      });
    };  

    self.update = function () {
      console.log('updating');
      var pathname = window.location.pathname.split('/');
      self.isEnterprise = $('body').hasClass('enterprise');      
      self.itemTypes = {};
      self.searchStr = 'div[data-path]';
      self.allItemsSearchStr = 'div[data-path]';
      self.typeIsVisible = self.typeIsVisible || {};
      self.$ghHelperNavUlItems.find('li.toggleLink').remove();
      self.$allItems = $(self.allItemsSearchStr);
      $(self.searchStr).each(function () {
        var itemType = $(this).attr('data-path').split('.').pop();
        if (!self.itemTypes.hasOwnProperty(itemType)) {
          self.itemTypes[itemType] = [];
        }
        if (!self.typeIsVisible.hasOwnProperty(itemType)) {
          self.typeIsVisible[itemType] = self.getSavedTypeIsVisible(itemType);
        }
        self.itemTypes[itemType].push($(this));

        if (!self.typeIsVisible[itemType]) {
          self.itemTypes[itemType].forEach(function (item) {            
              item.parent().hide();            
          });
        }        
      });
      var itemTypes = Object.keys(self.itemTypes);
      if (itemTypes.length) {
        itemTypes.forEach(function (itemType) {
          self.addToggleLink(itemType);          
        });        
        self.$ghHelperNav.addClass('active');       
      } else {
        self.$ghHelperNav.removeClass('active overflow');
      }      
    };

    self.setSavedTypeIsVisible = function(type, isVisible) {      
      self.savedSettings[type] = isVisible;      
      chrome.storage.local.set({'settings': self.savedSettings}, function(){console.log('saved complete', chrome.runtime.lastError)});        
    };

    self.getSavedTypeIsVisible = function(type) {      
      return self.savedSettings[type] !== undefined ? self.savedSettings[type] : true;        
    };
  
    chrome.storage.local.get('settings', function(items){
      self.savedSettings = items['settings'] || {};          
      console.log(self.savedSettings);  
      self.init();      
    });
    

  }
  $(document).ready(function () {
    var ghHelper = new GhHelper();
    $(window).bind('popstate', function () {
      ghHelper.update();
    });    
  });
}(jQuery));
