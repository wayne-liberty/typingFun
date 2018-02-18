import React, {Component} from "react";
import ReactDOM from "react-dom";
import SingleChar from "./SingleChar";
import Cursor from "./Cursor";
import PowerMode from "./lib/powerMode";
import InfoBoard from "./InfoBoard";
import {connect} from "react-redux";
import typeIn from "../../redux/actions/typeIn";
import toastr from 'toastr';
import DataVisualizer from './TypingDataVisualize';
import {toggleChart} from "../../redux/actions/stageStatus";
import PropTypes from 'prop-types';
import {debug} from "util";
import ArticleSelector from "./ArticleSelector";

@connect(
  state => {
    return {
      typeResult: state.typeResult,
      article: state.currentArticle
    };
  },

  dispatch => {
    return {
      saveTypeResult: res => {
        dispatch(typeIn(res));
      },
      toggleChart: showIt => {
        dispatch(toggleChart(showIt));
      }
    };
  }
)
class Stage extends Component {

  static propTypes = {
    typeResult: PropTypes.object.isRequired,
    saveTypeResult: PropTypes.func.isRequired,
    toggleChart: PropTypes.func.isRequired,
    article: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {'complete': false, 'article': {}};
    this.curPos = 0;
    this.childrenTable = [];

    this.keyPressed = this.keyPressed.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {
    this.loadDefaultArticle();
    this.powerMode = new PowerMode();
    this.powerMode.draw();
    window.addEventListener('scroll', () => this.scroll());
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.article.id === this.props.article.id) {
      return false;
    }
    this.loadArticle(nextProps.article.id);
    return true;
  }

  shouldComponentUpdate() {
    return false;
  }

  loadDefaultArticle() {
    this._loadArticle('/article');
  }

  loadArticle(articleId) {
    this.curPos = 0;
    this.childrenTable = [];
    this._loadArticle(`/article/${articleId}`);
  }

  _loadArticle(url) {
    const that = this;
    $.get(url, function (res) {
      console.log(res);
      if (!res.success) {
        toastr.error('default article load fail');
        return;
      } else {
        toastr.success('article loaded', 'success',
          {timeOut: 1000});
      }

      that.setState({complete: false, article: res.result}, function () {
        that.genTextArr();
        that.genChildren();
        that.forceUpdate(function () {
          that.moveCursor({dir: 0});
          that.focusStage();
        });
      });
    });
  }

  focusStage() {
    this.stage.focus();
  }

  genTextArr() {
    //todo think of better way
    this.textArr = this.state.article.text.split('');
  }

  genChildren() {
    const props = {
      registerMe: this.registerChild.bind(this)
    };

    const now = '-' + Date.now().toString();
    this.Children = this.textArr.map(
      (char, index) => (
        <SingleChar key={index + now} char={char} pos={index} {...props} />
      )
    );
  }

  registerChild(pos, child) {
    this.childrenTable[pos] = child;
  }

  keyPressed(e) {
    if (this.state.complete) return;
    e.preventDefault();

    const pressed = String.fromCharCode(e.charCode);

    this.props.saveTypeResult({
      pressedKey: pressed,
      expected: this.textArr[this.curPos],
      currentTime: new Date().getTime(),
      cursorPos: this.curPos
    });

    const isCorrect = this.childrenTable[this.curPos].keyPressed(pressed);
    if (isCorrect) {
      this.powerMode.spawnParticles(this.getCurrentTransform());
    }


    if (this.curPos < this.childrenTable.length - 1) {
      this.moveCursor({dir: 1});
    } else {
      this.setState(() => ({'complete': true}));
      this.complete();
    }

    this.curPos += 1;
    return false;
  }

  keyDown(e) {
    if (this.state.complete) return;
    if (this.curPos === 0) return false;

    const backSpaceKeyCode = 8;
    if (e.keyCode === backSpaceKeyCode) {
      this.moveCursor({dir: -1, isBack: true});
      this.curPos -= 1;
      return false;
    }
    return true;
  }

  getCurrentTransform() {
    const rect = ReactDOM.findDOMNode(this.childrenTable[this.curPos]).getBoundingClientRect();
    return {X: rect.x, Y: rect.y};
  }


  moveCursor(args) {
    const props = this.getCurrentCharRect(args.dir);

    this.cursor.setState(() => {
      return {styles: props};
    });

    if (args.isBack) {
      this.childrenTable[this.curPos].setState(() => ({classNames: [], typeResult: ''}));
    } else {
      this.childrenTable[this.curPos].setState(() => ({classNames: []}));
    }

    const nextChar = this.childrenTable[this.curPos + args.dir];
    nextChar.setState(prestate => {
      return {classNames: ['curChar', ...(prestate.classNames || [])]};
    });
  }

  getCurrentCharRect(offset = 0) {
    const boundingRect = (ReactDOM.findDOMNode(this.childrenTable[this.curPos + offset]).getBoundingClientRect());
    return {
      left: boundingRect.left,
      top: boundingRect.top,
      height: boundingRect.height,
      width: boundingRect.width
    };
  }

  complete() {
    toastr.info('type complete');
    console.log(this.props.typeResult);
    const typeResult = this.props.typeResult;
    typeResult.article = this.state.article;

    $.post('/typing/complete', typeResult, function success(msg) {
      console.log(msg);
    });

    this.props.toggleChart(true);
  }

  scroll() {
    this.moveCursor({dir: 0});
  }


  static getRefMem = {};

  getRefBuilder(refName) {
    const that = this;
    if (Stage.getRefMem[refName]) {
      return Stage.getRefMem[refName];
    }

    const func = function (elem) {
      that[refName] = elem;
    };

    Stage.getRefMem[refName] = func;
    return func;
  }

  render() {
    const currentArticle = this.props.article;

    if (currentArticle.name !== 'default') {
      console.log('new');
    }
    return (
      <div
        className="typing main"
        tabIndex="0"
        onKeyPress={this.keyPressed}
        onKeyDown={this.keyDown}
        ref={this.getRefBuilder('stage')}
      >
        <InfoBoard>
          children
        </InfoBoard>
        <div
          id="stage-wrap"
          className="col-md-10 col-md-offset-1"
        >
          <canvas id="canvas" className="col-md-10"/>
          <div
            id="stage"
          >
            {this.Children}
            <Cursor ref={elem => this.cursor = elem}/>
          </div>
        </div>
        <DataVisualizer
          ref={elem => {
            this.visualizer = elem;
          }}
        />
        <ArticleSelector/>
      </div>
    );
  }
}


Stage.contextTypes = {store: PropTypes.object};

export default Stage;