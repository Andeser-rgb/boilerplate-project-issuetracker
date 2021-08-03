'use strict';
const mongoose = require('mongoose');
const IssueModel = require('../models').Issue;
const ProjectModel = require('../models').Project;

module.exports = function (app) {

    app.route('/api/issues/:project')
        .get(function (req, res){
            let project = req.params.project;
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData){
                    res.json([]);
                }
                else{
                    const filterEntries = Object.entries(req.query);
                    res.json(projectData.issues.filter(d => filterEntries.every(([key, value]) => d[key] === value)));
                }
            });
        })
        .post(function (req, res){
            let project = req.params.project;
            const {
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            } = req.body;
            if(!issue_title || !issue_text || !created_by){
                res.json({error: 'required field(s) missing'});
                return;
            }

            const newIssue = new IssueModel({
                issue_title: issue_title || '',
                issue_text: issue_text || '',
                created_by: created_by || '',
                created_on: new Date(),
                updated_on: new Date(),
                assigned_to: assigned_to || '',
                status_text: status_text || '',
                open: true
            });
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData){
                    const newProject = new ProjectModel({
                        name: project,
                    });
                    newProject.issues.push(newIssue);
                    newProject.save((err, data) => {
                        res.json(err || !data
                                 ? {error: "There was an error saving in post"}
                                 : data);
                    });
                }
                else{
                    projectData.issues.push(newIssue);
                    projectData.save((err, data) => {
                        res.json(err || !data
                                 ? {error: "There was an error saving in post"}
                                 : data);
                    });
                }
            });

        })
        .put(function (req, res){
            let project = req.params.project;
            const {
                _id,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text,
                open
            } = req.body;
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData) res.send("Project not found");
                else{
                    const issueData = projectData.issues.id(_id);
                    if(!issueData) res.send("Id not found");
                    else{
                        issueData.issue_title = issue_title || issueData.issue_title;
                        issueData.issue_text = issue_text || issueData.issue_text;
                        issueData.created_by = created_by || issueData.created_by;
                        issueData.assigned_to = assigned_to || issueData.assigned_to;
                        issueData.status_text = status_text || issueData.status_text;
                        issueData.open = open || issueData.open;
                        issueData.updated_on = new Date();
                        projectData.save((err, data) => {
                            if(err || !data) res.json({error: "could not update", _id: _id});
                            else res.json({result: "Successfuly updated", _id: _id});
                        });
                    }
                }
            });
        })
        .delete(function (req, res){
            let project = req.params.project;
        });
};
