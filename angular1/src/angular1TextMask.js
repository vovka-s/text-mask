/*global angular*/
import createTextMaskInputElement from '../../core/src/createTextMaskInputElement'

function textMask() {
  'ngInject'

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      textMask: '='
    },
    link: function(scope, element, attrs, ngModel) {
      var inputElement
      var textMaskInputElement

      function setCaretPosition(ctrl, pos) {
        // Modern browsers
        if (ctrl.setSelectionRange) {
          ctrl.focus();
          ctrl.setSelectionRange(pos, pos);
        
        // IE8 and below
        } else if (ctrl.createTextRange) {
          var range = ctrl.createTextRange();
          range.collapse(true);
          range.moveEnd('character', pos);
          range.moveStart('character', pos);
          range.select();
        }
      }

      if (element[0].tagName === 'INPUT') {
        // `textMask` directive is used directly on an input element
        inputElement = element[0]
      } else {
        // `textMask` directive is used on an abstracted input element
        inputElement = element[0].getElementsByTagName('INPUT')[0]
      }

      element.on('blur keyup change input', function() {
        textMaskInputElement.update(inputElement.value)
        ngModel.$setViewValue(inputElement.value)
      })

      element.on('click', function() {
        var regex = /(\d)(?!.*\d)/;
        var lastDigit = !!inputElement.value ? regex.exec(inputElement.value)[0] : null;
        var lastDigitIndex = !!lastDigit ? inputElement.value.lastIndexOf(lastDigit) : null;
        var caretPosition = !!lastDigitIndex && [' ', '-'].indexOf(inputElement.value[lastDigitIndex+1]) > -1
          ? lastDigitIndex+1
          : lastDigitIndex;

        if (caretPosition < inputElement.selectionStart) {
          setCaretPosition(inputElement, caretPosition ? caretPosition+1 : 0);
        }
      })

      // reset Text Mask when `scope.textMask` object changes
      scope.$watch('textMask', () => {
        initTextMask()
        textMaskInputElement.update()
      }, true)

      function initTextMask() {
        textMaskInputElement = createTextMaskInputElement(
          Object.assign({inputElement}, scope.textMask)
        )
      }

      function formatter(fromModelValue) {
        // set the `inputElement.value` for cases where the `mask` is disabled
        var normalizedValue = fromModelValue == null ? '' : fromModelValue
        inputElement.value = normalizedValue

        textMaskInputElement.update(normalizedValue)
        return inputElement.value
      }

      initTextMask()
      ngModel.$formatters.unshift(formatter)
    }
  }
}

const textMaskModule = angular
  .module('text-mask', [])
  .directive('textMask', textMask)
  .name

export default textMaskModule
export {default as conformToMask} from '../../core/src/conformToMask.js'
