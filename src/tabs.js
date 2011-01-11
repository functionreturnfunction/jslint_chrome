/*Copyright 2011 Jason Duncan, Nicholas Ortenzio

This file is part of the JSLint Extension for Google Chrome.

The JSLint Extension for Google Chrome is free software: you can redistribute it
and/or modify it under the terms of the GNU General Public License as published
by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

The JSLint Extension for Google Chrome is distributed in the hope that it will
be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public
License for more details.

You should have received a copy of the GNU General Public License along with the
JSLint Extension for Google Chrome.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($){

  $.fn.tabs = function() {
    return $(this).each(function(){
      var $this = $(this).addClass('ui-tab');
      var $navs = $this.find('> ul > li').addClass('ui-nav');
      var $panes = $this.find('> div').addClass('ui-pane');

      $navs.find('a').click(function(e){
        e.stopPropagation();
        var i = $navs.index($(this).parent());
        $navs.removeClass('ui-active').eq(i).addClass('ui-active');
        $panes.removeClass('ui-active').eq(i).addClass('ui-active');
      }).eq(0).click();

    })
  }

})(jQuery);

