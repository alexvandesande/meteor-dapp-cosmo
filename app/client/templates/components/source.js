/**
Template Controllers

@module Templates
*/

/**
The accounts template

@class [template] components_source
@constructor
*/

Template['components_source'].created = function(){    
    Module['onRuntimeInitialized'] = function() {
        Cosmo.runtimeInit = true;
    };
    
    var count = 0;
    this.runtimeInitInterval = Meteor.setInterval(function() {
        if(count >= 1)
            Cosmo.onAceUpdate({});
        
        if(Cosmo.runtimeInit) {
            count ++;
            return;
        }
    }, 1 * 2000);
};

Template['components_source'].helpers({
	/**
    On Ace editor render.

    @method (onAce)
    */
    
    'onAce': function(){ return function(editor){
        editor.setTheme('ace/theme/monokai');
        editor.getSession().setMode('ace/mode/javascript');
        editor.setShowPrintMargin(false);
        editor.getSession().setUseWrapMode(true);
        editor.getSession().setTabSize(4);
        editor.getSession().setUseSoftTabs(true);
        Cosmo.editorObject = editor;
        editor.getSession().on('change', Cosmo.onAceUpdate);
        editor.insert('contract Ballot {\n    \/\/ Create a new ballot with $(_numProposals) different proposals.\n    function Ballot() {\n        address sender = msg.sender;\n        chairperson = sender;\n        numProposals = 5;\n    }\n\n    \/\/ Give $(voter) the right to vote on this ballot.\n    \/\/ May only be called by $(chairperson).\n    function giveRightToVote(address voter) {\n        if (msg.sender != chairperson || voted[voter]) return;\n        voterWeight[voter] = 1;\n    }\n\n    \/\/ Delegate your vote to the voter $(to).\n    function delegate(address to) {\n        address sender = msg.sender;\n        if (voted[sender]) return;\n        while (delegations[to] != address(0) && delegations[to] != sender)\n            to = delegations[to];\n        if (to == sender) return;\n        voted[sender] = true;\n        delegations[sender] = to;\n        if (voted[to]) voteCounts[votes[to]] += voterWeight[sender];\n        else voterWeight[to] += voterWeight[sender];\n    }\n\n    \/\/ Give a single vote to proposal $(proposal).\n    function vote(uint8 proposal) {\n        address sender = msg.sender;\n        if (voted[sender] || proposal >= numProposals) return;\n        voted[sender] = true;\n        votes[sender] = proposal;\n        voteCounts[proposal] += voterWeight[sender];\n    }\n\n    function winningProposal() constant returns (uint8 winningProposal) {\n        uint256 winningVoteCount = 0;\n        uint8 proposal = 0;\n        while (proposal < numProposals) {\n            if (voteCounts[proposal] > winningVoteCount) {\n                winningVoteCount = voteCounts[proposal];\n                winningProposal = proposal;\n            }\n            ++proposal;\n        }\n    }\n\n    address public chairperson;\n    uint8 public numProposals;\n    mapping(address => uint256) public voterWeight;\n    mapping(address => bool) public voted;\n    mapping(address => uint8) public votes;\n    mapping(address => address) public delegations;\n    mapping(uint8 => uint256) public voteCounts;\n}\n');
        editor.gotoLine(0);
        editor.scrollToLine(0);
        editor.scrollToRow(0);
    }},
});

Template['components_source'].events({   
    /**
    On refresh page.

    @event (click #refresh)
    */
    
    'click #refresh': function(){
        console.log('cool!');
        Session.set('refresh', true);          
        Cosmo.editorObject.setValue(Cosmo.editorObject.getValue() + ' ');
        Session.set('refresh', false);
        //Cosmo.editorObject.blur();
        //console.log(Cosmo.editorObject.selection.getCursor());
        //console.log(Cosmo.editorObject);s
    },
    
    /**
    Toggle auto update on/off.

    @event (click #auto)
    */
    
    'click #auto': function(){
        Session.set('auto', (Session.get('auto') ? false : true));
        $('#auto').blur();
    },
    
    /**
    on contract deploy.

    @event (change #method)
    */
    
    'click #deploy': function(){
        var gasValue = parseInt($('#deployGas').val());
        var contractAbi = Session.get('contractAbi');
        var contractHex = Session.get('hex');
        var transactionOptions = {from: web3.eth.accounts[0], data: contractHex};
        
        if(gasValue == 0 || _.isUndefined(gasValue) || _.isEmpty(gasValue)) {
            transactionOptions.gas = 1800000;
            transactionOptions.gasPrice = web3.eth.gasPrice;
        }
        
        if(gasValue > 0) {
            transactionOptions.gas = gasValue;
            transactionOptions.gasPrice = web3.eth.gasPrice;
        }
            
        if(!_.isArray(contractAbi) || contractAbi.length == 0)
            return;
        
        if(contractHex.length == 0)
            return;
        
        var address = Cosmo.deploy(contractAbi, transactionOptions);        
        Session.set('contractAddress', address);
    },
});