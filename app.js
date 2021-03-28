let emiCalculator = (function () {
    let customerDetails = {};
    let strOutput = '';

    //creating initial objects based on LOAN query
    let createLoanObject = function (input) {
         
        let loanInputData = (input.split(" ")).slice(1);
        let keysforLoanObject = ['bank_name', 'borrower_name', 'prin_amount', 'no_of_years', 'rate_of_interest'];
        var customerDetailsCopy = customerDetails
        for (var indexAfterSplit = 0; indexAfterSplit < loanInputData.length; indexAfterSplit++) {
            if (indexAfterSplit == 0) {
                var key = loanInputData[indexAfterSplit];
                customerDetailsCopy[key] = {}
                customerDetailsCopy = customerDetailsCopy[key]
            }
            customerDetailsCopy[keysforLoanObject[indexAfterSplit]] = loanInputData[indexAfterSplit];
        }
    }

    //appending payment details to initially created LOAN queries
    let appendPaymentToObject = function (input) {
        
        let inputData = (input.split(" ")).slice(1);
        let keysforPaymentObject = ['payment', 'no_of_emi_after_payment'];
        let paymentDoneFlag = 0;
        for (let bank in customerDetails) {
            
            if (bank == inputData[0] && customerDetails[bank]['borrower_name'] == inputData[1]) {
                paymentDoneFlag = 1;
                customerDetails[bank][keysforPaymentObject[0]] = inputData[2]
                customerDetails[bank][keysforPaymentObject[1]] = inputData[3]

            }  
        }
        if(!paymentDoneFlag){
            handleBadResponseQuery("No Account detected", input);
        }
        
    }

    //routing different functions for calculating balance emi_count and piad_amount
    let balanceCalculation = function (input) {
        let individualCustomerDetail = fetchCustomerDetailBasedOnBalanceQuery(input);
        if(individualCustomerDetail!=undefined){
            let totalAmount = calculateTotalLoanAmount(individualCustomerDetail);
            let EMIPerMonth = Math.ceil(totalAmount / (Number(individualCustomerDetail['no_of_years']) * 12));
            console.log(individualCustomerDetail)
            let amountPaid = calculateTotalAmountPaid(EMIPerMonth, individualCustomerDetail);
            let remainingEMICount = Math.ceil((totalAmount - amountPaid) / EMIPerMonth);
            convertToOutputFormat(amountPaid, remainingEMICount, individualCustomerDetail);
        }
        else{
            handleBadResponseQuery("No Account detected",input);
        }
    }

    //calculating aount paid based on emi_count given
    let calculateTotalAmountPaid = function (EMIAmount, loanObject) {
        let amountPaid = 0;
        if (loanObject['bal_after_EMI'] >= loanObject['no_of_emi_after_payment']) {
            amountPaid = (EMIAmount * loanObject['bal_after_EMI']) + Number(loanObject['payment']);
        }
        else {
            amountPaid = EMIAmount * loanObject['bal_after_EMI'];
        }
        return amountPaid;
    }

    //fetching desired records based on BALANCE query given
    let fetchCustomerDetailBasedOnBalanceQuery = function (input) {
        
        let inputData = (input.split(" ")).slice(1);
        for (let bank in customerDetails) {
            if (bank == inputData[0] && customerDetails[bank]['borrower_name'] == inputData[1]) {
                customerDetails[bank]['bal_after_EMI'] = inputData[2]
                return customerDetails[bank]

            }
            
        }
    }

    //calculating total amount I=P+A
    let calculateTotalLoanAmount = function (loanObject) {
        const interestAmount = (loanObject['prin_amount'] * loanObject['no_of_years'] * loanObject['rate_of_interest']) / 100;
        const totalAmount = Math.ceil(Number(loanObject['prin_amount']) + interestAmount);
        return totalAmount;
    }

    //converting object to desired output format
    let convertToOutputFormat = function (amountPaid, remainingEMICount, loanObject) {
          strOutput += loanObject['bank_name'] + " " + loanObject['borrower_name'] + " " + amountPaid.toString() + " " + remainingEMICount.toString() + "\n";
    }

    //handling bad user inputs
    let handleBadResponseQuery = function(errorStr,input){
        strOutput += errorStr +" [ "+input+" ] "+ "\n";
    }

    //Public methods
    return {
        
        //initial parsing after fetching queries from input field
        parseInput: function (inputData) {
            let inputQueries = inputData.split("\n");
            for (let queryIndex = 0; queryIndex < inputQueries.length; queryIndex++) {

                if (inputQueries[queryIndex].includes("LOAN")) {
                    createLoanObject(inputQueries[queryIndex]);
                }
                else if (inputQueries[queryIndex].includes("PAYMENT")) {
                    appendPaymentToObject(inputQueries[queryIndex]);
                }
                else if (inputQueries[queryIndex].includes("BALANCE")) {
                    balanceCalculation(inputQueries[queryIndex]);
                }
                else {
                    handleBadResponseQuery("Not a valid Input Query",inputQueries[queryIndex]);
                }
            }
        },

        //displaying output in output window
        displayOutput: function () {
            document.getElementById("output_data").value = strOutput;
            strOutput = '';
            customerDetails = {};
        }

    }
})();

//main function
function app() {

    let inputData = document.getElementById("input_data").value;
    emiCalculator.parseInput(inputData);
    emiCalculator.displayOutput();
}
