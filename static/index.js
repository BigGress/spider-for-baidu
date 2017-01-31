(function() {
    Vue.use(VueMaterial);

    var app = new Vue({
        el: "#app",
        data: {
            test:"test123",
            key: "",
            tooltip: "",
            email: ""
        },
        methods: {
            submit: function() {
                let that = app;
                if (!that.email) {
                    alert("输入邮箱")
                    return false;
                }
                console.log(this)
                $.ajax({
                    url: "/send",
                    method: "post",
                    data: {
                        key: that["key"],
                        mail: that.email
                    }
                }).then(e => {
                    this.tooltip = e.msg;
                    setTimeout(() => {
                        this.tooltip = "搜索中"
                    }, 2000);
                })
            },
            testA: function() {
                $.ajax({
                    url: "/test",
                    method: "post",
                    data: {
                        key: "123"
                    }
                }).then(e => {
                    this.tooltip = e.msg;
                    setTimeout(() => {
                        this.tooltip = ""
                    }, 2000);
                })
            }
        }
    })
})()