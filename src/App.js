import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postsFetched: [],
      postsFetchedOk: false,
      postsFetchLoading: true,
      newPostTitle: '',
      newPostContent: '',
      currentUser: '',
      commentDraftDict: {}
    }
  }

  performRequest() {
    axios.get('https://my-social-network.visvanathannaditya.workers.dev/posts')
    .then((response) => {
      let commentDraftDict = {};
      const respData = JSON.parse(response.data).allPosts;
      respData.forEach((post) => {
        commentDraftDict[post.id] = '';
      });
      this.setState({
        postsFetched: respData,
        postsFetchedOK: true,
        postsFetchLoading: false,
      });
    })
    .catch((error) => {
      this.setState({
        postsFetchedOK: false,
        postsFetchLoading: false
      });
    });
  }

  componentDidMount() {
    const username = window.prompt("Enter username:");
    this.setState({currentUser: username});
    this.performRequest();
  };

  handleTitleChange = (event) => {
    const newValue = event.target.value;
    this.setState({newPostTitle: newValue});
  }

  handlePostContentChange = (event) => {
    const newValue = event.target.value;
    this.setState({newPostContent: newValue});
  }

  handleSubmit = (event) => {
    const {newPostTitle, newPostContent, currentUser} = this.state;
    const newPost = {
      title: newPostTitle,
      username: currentUser,
      content: newPostContent,
      timestamp: +new Date
    }
    axios.post('https://my-social-network.visvanathannaditya.workers.dev/posts', newPost)
    .then((response) => {
      this.setState({
        newPostTitle: '',
        newPostContent: ''
      });
      this.performRequest();
    })
    .catch((error) => {

    })
  }

  convertUnixTimestampToDateTime(unixTimestamp) {
    let dateFull = new Date(unixTimestamp);
    let month = dateFull.getMonth();
    let year = dateFull.getFullYear();
    let date = dateFull.getDate();
    let hour = dateFull.getHours();
    let min = dateFull.getMinutes();
    return hour + ":" + min + " " + month + "/" + date + "/" + year;
  }

  postComment(postId) {
    axios.put("https://my-social-network.visvanathannaditya.workers.dev/posts/"+postId, {
      content: this.state.commentDraftDict[postId],
      timestamp: +new Date,
      username: this.state.currentUser
    })
    .then((response) => {
      let commentDraftDict = this.state.commentDraftDict;
      commentDraftDict[postId] = '';
      this.setState({commentDraftDict: commentDraftDict});
      this.performRequest();
    });
  }

  getCommentsListGroup(postObj) {
    let commentsList = [];
    postObj.comments.forEach(comment => {
    let commentListItem =
        <ListGroup.Item>
          <Card>
            <Card.Body>
              <Card.Subtitle className="mb-2 text-muted">@{comment.username} - {this.convertUnixTimestampToDateTime(parseInt(comment.timestamp))}</Card.Subtitle>
              <Card.Text>
                {comment.content}
              </Card.Text>
            </Card.Body>
          </Card>
        </ListGroup.Item>
    commentsList.push(commentListItem);
    });
    const commentBox =
      <Form>
          <Form.Control
            id={postObj.id}
            placeholder="Comment" 
            type="text" 
            required  
            value={this.state.commentDraftDict[postObj.id]}
            onChange={(event) => {
              let commentDraftDict = {...this.state.commentDraftDict};
              commentDraftDict[postObj.id] = event.target.value;
              this.setState({commentDraftDict: commentDraftDict});
            }}
          />
          <Button variant="primary" onClick={() => {
            this.postComment(postObj.id);
          }}>Post</Button>
      </Form>
    commentsList.push(commentBox);
    return commentsList;
  }

  getPostListGroup(posts) {
    let postCards = [];
    posts.forEach(post => {
      let commentsList = this.getCommentsListGroup(post);
      let cardListItem =
        <ListGroup.Item key={post.id}>
          <Card>
            <Card.Header>{post.title}</Card.Header>
            <Card.Body>
              <Card.Subtitle className="mb-2 text-muted">@{post.username} - {this.convertUnixTimestampToDateTime(post.timestamp)}</Card.Subtitle>
              <Card.Text>
                {post.content}
              </Card.Text>
            </Card.Body>
          </Card>
        <ListGroup>
          {commentsList}
        </ListGroup>
      </ListGroup.Item>
      postCards.push(cardListItem);
    });
    return postCards;
  }

  render() {
    const { postsFetched, postsFetchLoading, postsFetchedOK, newPostContent, newPostTitle } = this.state;
    let postCards = this.getPostListGroup(postsFetched);
    
    return (
    <div className="App">
      <div class="container-fluid text-sm-center p-2 bg-light">
        <h1 class="display-2">My new Social Network</h1>
      </div>
      <LoadingOverlay
        active={postsFetchLoading}
        spinner
        text='Loading...'
      />
      <div className="postsContainer">
        {postsFetchedOK ? <ListGroup className="centered">{postCards}</ListGroup> : ''}
      </div>
    
      <div className="newPost">
        <Form>
          <Form.Group className="mb-3">
            <Form.Control 
              required size="lg" 
              type="text"
              value={newPostTitle}
              placeholder="Post Title"
              onChange={this.handleTitleChange}
              />
            <Form.Control
              required  
              as="textarea" 
              placeholder="Content" 
              rows={4}
              value={newPostContent}
              onChange={this.handlePostContentChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Button variant="primary" onClick={this.handleSubmit}>Create New Post</Button>
          </Form.Group>
        </Form>
        
      </div>
    </div>
    );
  }
}

export default App;
