const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongoose').Types.ObjectId;
const IssueModel = require('../models').Issue;
const ProjectModel = require('../models').Project;

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite('Post request', () => {
        test('Post request with every field', (done) => {
            const issue = {
                issue_title: "1984",
                issue_text: "I'm a book",
                created_by: "George Orwell",
                assigned_to: "Andrea",
                status_text: "Enjoyable"
            };
            chai
                .request(server)
                .post('/api/issues/{project}')
                .type('form')
                .send(issue)
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.issue_title, issue.issue_title);
                    assert.equal(res.body.issue_text, issue.issue_text);
                    assert.equal(res.body.created_by, issue.created_by);
                    assert.equal(res.body.assigned_to, issue.assigned_to);
                    assert.equal(res.body.status_text, issue.status_text);
                    done();
                });
        });
        test('Post request with required fields', (done) => {
            const issue = {
                issue_title: "1984",
                issue_text: "I'm a book",
                created_by: "George Orwell"
            };
            chai
                .request(server)
                .post('/api/issues/{project}')
                .type('form')
                .send(issue)
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.issue_title, issue.issue_title);
                    assert.equal(res.body.issue_text, issue.issue_text);
                    assert.equal(res.body.created_by, issue.created_by);
                    done();
                });
        });
        test('Post request with missing required fields', (done) => {
            const issue = {
                issue_title: "1984",
                issue_text: "I'm a book",
                assigned_to: "Andrea",
                status_text: "Enjoyable"
            };
            chai
                .request(server)
                .post('/api/issues/{project}')
                .type('form')
                .send(issue)
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });
        });
    });
    suite('Get request', () => {
        test('Issues on a project', (done) => {
            chai
                .request(server)
                .get('/api/issues/{project}')
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.isArray(res.body);
                    assert.isNotEmpty(res.body);
                    done();
                });
        });
        test('Issues on a project with one filter', (done) => {
            chai
                .request(server)
                .get('/api/issues/{project}')
                .query({
                    issue_title: "1984"
                })
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.isArray(res.body);
                    assert.isTrue(res.body.every(d => d.issue_title === '1984'));
                    done();
                });
        });
        test('Issues on a project with one filter', (done) => {
            chai
                .request(server)
                .get('/api/issues/{project}')
                .query({
                    issue_title: "1984",
                    created_by: "George Orwell"
                })
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.isArray(res.body);
                    assert.isTrue(res.body.every(d => d.issue_title === "1984" && d.created_by === "George Orwell"));
                    done();
                });
        });
    });
    suite('Put request', () => {

        test('Update one field on an issue', (done) => {
            ProjectModel.findOne({
                name: '{project}'
            }, (err, projectData) => {
                const _id = projectData.issues[0]._id;
                chai
                    .request(server)
                    .put('/api/issues/{project}')
                    .send({
                        _id: _id,
                        issue_text: "Hello"
                    })
                    .end((err, res) => {
                        assert.equal(200, res.status);
                        assert.equal(res.body.result, 'successfully updated');
                        assert.equal(res.body._id, _id);
                        done();
                    });
            });
        });
        test('Update multiple fields on an issue', (done) => {
            ProjectModel.findOne({
                name: '{project}'
            }, (err, projectData) => {
                const _id = projectData.issues[0]._id;
                chai
                    .request(server)
                    .put('/api/issues/{project}')
                    .send({
                        _id: _id,
                        issue_text: "Hello",
                        issue_title: "Francesco"
                    })
                    .end((err, res) => {
                        assert.equal(200, res.status);
                        assert.equal(res.body.result, 'successfully updated');
                        assert.equal(res.body._id, _id);
                        done();
                    });
            });
        });
        test('Update an issue with missing _id', (done) => {
            chai
                .request(server)
                .put('/api/issues/{project}')
                .send({
                    issue_text: "Hello",
                    issue_title: "Francesco"
                })
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });
        test('Update an issue with no fields', (done) => {
            ProjectModel.findOne({
                name: '{project}'
            }, (err, projectData) => {
                const _id = projectData.issues[0]._id;
                chai
                    .request(server)
                    .put('/api/issues/{project}')
                    .send({
                        _id: _id
                    })
                    .end((err, res) => {
                        assert.equal(200, res.status);
                        assert.equal(res.body.error, 'no update field(s) sent');
                        assert.equal(res.body._id, _id);
                        done();
                    });
            });
        });
        test('Update an issue with an invalid Id', (done) => {
            const _id = '610a4c7065b0e07db3';
            chai
                .request(server)
                .put('/api/issues/{project}')
                .send({
                    _id: _id,
                    issue_text: "Hello",
                    issue_title: "Francesco"
                })
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, _id);
                    done();
                });
        });
    });
    suite('Delete request', () => {
        test('Delete an issue', (done) => {
            ProjectModel.findOne({
                name: '{project}'
            }, (err, projectData) => {
                const _id = projectData.issues[0]._id;
                chai
                    .request(server)
                    .delete('/api/issues/{project}')
                    .send({
                        _id: _id
                    })
                    .end((err, res) => {
                        assert.equal(200, res.status);
                        assert.equal(res.body.result, "successfully deleted");
                        assert.equal(res.body._id, _id);
                        done();
                    });
            });
        });
        test('Delete an issue with invalid id', (done) => {
            const _id = '123jodf43';
            chai
                .request(server)
                .delete('/api/issues/{project}')
                .send({
                    _id: _id
                })
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.error, "could not delete");
                    assert.equal(res.body._id, _id);
                    done();
                });
        });
        test('Delete an issue with missing id', (done) => {
            chai
                .request(server)
                .delete('/api/issues/{project}')
                .send()
                .end((err, res) => {
                    assert.equal(200, res.status);
                    assert.equal(res.body.error, "missing _id");
                    done();
                });
        });
    });
});
