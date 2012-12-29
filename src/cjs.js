var cjs = (function (root) {
var __debug = true;

//
// ============== CJS CORE ============== 
//

// The star of the show!
var old_cjs = root.cjs;
var cjs = function () { return cjs.$.apply(cjs, arguments); };
cjs.version = "0.7.0";

cjs.noConflict = function() { root.cjs = old_cjs; return cjs; };

//
// ============== UTILITY FUNCTIONS ============== 
//
var construct = function(constructor, args) {
    var F = function() { return constructor.apply(this, args); }
    F.prototype = constructor.prototype;
    return new F();
};
var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
var slice = ArrayProto.slice,
	toString = ObjProto.toString,
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map;

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

var camel_case = (function() {
	var rdashAlpha = /-([a-z]|[0-9])/ig, rmsPrefix = /^-ms-/;
	var fcamelCase = function(all, letter) {
		return String(letter).toUpperCase();
	};
	return function(string) {
		return string.replace( rmsPrefix, "ms-" ).replace(rdashAlpha, fcamelCase);
	};
}());

// Return a unique id when called
var uniqueId = (function() {
	var id = 0;
	return function() { return id++; };
}());

// Clone
var clone = function(obj) {
	if (!isObject(obj)) return obj;
	return isArray(obj) ? obj.slice() : extend({}, obj);
};

// Return the first item in arr where test is true
var index_where = function(arr, test, start_index) {
	var i, len = arr.length;
	if(isNumber(start_index)) {
		start_index = Math.round(start_index);
	} else {
		start_index = 0;
	}
	for(i = start_index; i<len; i++) {
		if(test(arr[i], i)) { return i; }
	}
	return -1;
};

//Bind a function to a context
var bind = function(func, context) {
	return function() { return func.apply(context, arguments); };
};

var eqeqeq = function(a, b) { return a === b; };
// Return the first item in arr equal to item (where equality is defined in equality_check)
var index_of = function(arr, item, start_index, equality_check) {
	equality_check = equality_check || eqeqeq;
	return index_where(arr, function(x) { return equality_check(item, x); }, start_index);
};

// Remove an item in an array
var remove = function(arr, obj) {
	var index = index_of(arr, obj);
	if(index>=0) { arr.splice(index, 1); }
	return index;
};

// Remove every item from an array
var clear = function(arr) {
	arr.length = 0;
};
  
// Is a given value a number?
var isNumber = function(obj) {
	return toString.call(obj) == '[object Number]';
};

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
var isArray = Array.isArray || function(obj) {
	return toString.call(obj) == '[object Array]';
};
  
// Is a given value a DOM element?
var isElement = function(obj) {
	return !!(obj && (obj.nodeType === 1 || obj.nodeType === 8 || obj.nodeType === 3));
};
  
// Is a given value a function?
var isFunction = function(obj) {
	return toString.call(obj) == '[object Function]';
};

var isString = function(obj) {
	return toString.call(obj) == '[object String]';
};

// Is a given variable an object?
var isObject = function(obj) {
	return obj === Object(obj);
};

// Is a given variable an arguments object?
var isArguments = function(obj) {
	return toString.call(obj) == '[object Arguments]';
};
 
// Keep the identity function around for default iterators.
var identity = function(value) {
	return value;
};

// Retrieve the values of an object's properties.
var values = function(obj) {
	return map(obj, identity);
};
  
// Safely convert anything iterable into a real, live array.
var toArray = function(obj) {
	if (!obj)                                     return [];
	if (isArray(obj))                           return slice.call(obj);
	if (isArguments(obj))                       return slice.call(obj);
	if (obj.toArray && isFunction(obj.toArray)) return obj.toArray();
	return values(obj);
};

// Set a constructor's prototype
var proto_extend = function (subClass, superClass) {
	var F = function() {};
	F.prototype = superClass.prototype;
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;
	
	subClass.superclass = superClass.prototype;
	if(superClass.prototype.constructor === Object.prototype.constructor) {
		superClass.prototype.constructor = superClass;
	}
};

var extend = function(obj) {
	var args = slice.call(arguments, 1)
		, i
		, len = args.length;
	for(i = 0; i<len; i++) {
		var source = args[i];
		for (var prop in source) {
			obj[prop] = source[prop];
		}
	}
	return obj;
};
var each = function(obj, iterator, context) {
	if (obj == null) { return; }
	if (nativeForEach && obj.forEach === nativeForEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (var i = 0, l = obj.length; i < l; i++) {
			if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) { return; }
		}
	} else {
		for (var key in obj) {
			if (has(obj, key)) {
				if (iterator.call(context, obj[key], key, obj) === breaker) { return; }
			}
		}
	}
};
var map = function(obj, iterator, context) {
	var results = [];
	if (obj == null) { return results; }
	if (nativeMap && obj.map === nativeMap) { return obj.map(iterator, context); }
	each(obj, function(value, index, list) {
		results[results.length] = iterator.call(context, value, index, list);
	});
	if (obj.length === +obj.length) { results.length = obj.length; }
	return results;
};

var last = function(arr) {
	return arr[arr.length - 1];
};

var hasOwnProperty = Object.prototype.hasOwnProperty;
var has = function(obj, key) {
	return hasOwnProperty.call(obj, key);
};


var nativeFilter = Array.prototype.filter;
var filter = function(obj, iterator, context) {
	var results = [];
	if (obj == null) { return results; }
	if (nativeFilter && obj.filter === nativeFilter) { return obj.filter(iterator, context); }
	var i, len = obj.length, value;
	for(i = 0; i<len; i++) {
		value = obj[i];
		if(iterator.call(context, value, i, obj)) { results.push(value); }
	}
	return results;
};

//
// ============== CONSTRAINT SOLVER ============== 
//
//   Edge from A -> B means A sends data to B
//   ---

//   Constraint Solver: Implements constraint solving, as described in:
//   Brad Vander Zanden, Brad A. Myers, Dario A. Giuse, and Pedro Szekely. 1994. Integrating pointer variables into one-way constraint models. ACM Trans. Comput.-Hum. Interact. 1, 2 (June 1994), 161-213. DOI=10.1145/180171.180174 http://doi.acm.org/10.1145/180171.180174

var constraint_solver = (function() {
	var ConstraintNode = function(obj, options) {
		this.outgoingEdges = [];
		this.incomingEdges = [];
		this.nullificationListeners = [];
		this.obj = obj;
		this.valid = false;

		this.options = extend({
									auto_add_outgoing_dependencies: true,
									auto_add_incoming_dependencies: true,
									cache_value: true
								},
								options);
		
		this.obj.__cjs_cs_node__ = this;
		this.timestamp = 0;
		this.id = uniqueId();
	};
	(function(my) {
		var proto = my.prototype;
		proto.cs_eval = function() { return this.obj.cjs_getter(); };
		proto.mark_invalid = function() { this.valid = false; };
		proto.mark_valid = function() { this.valid = true; };
		proto.is_valid = function() { return this.valid; };
		proto.update_value = function() {
			if(this.options.cache_value) {
				this.value = this.cs_eval();
			} else {
				this.cs_eval();
			}
		};

		proto.addOutgoingEdge = function(edge) { this.outgoingEdges.push(edge); };
		proto.addIncomingEdge = function(edge) { this.incomingEdges.push(edge); };

		proto.removeOutgoingEdge = function(edge) { remove(this.outgoingEdges, edge); };
		proto.removeIncomingEdge = function(edge) { remove(this.incomingEdges, edge); };

		proto.getOutgoing = function() { return this.outgoingEdges; };
		proto.getIncoming = function() { return this.incomingEdges; };

		proto.onNullify = function(callback) {
			this.nullificationListeners.push(callback);
		};
		proto.offNullify = function(callback) {
			var ri;
			do {
				ri = remove(this.nullificationListeners, callback);
			} while (ri >= 0);
		};

		//Take out the incoming & outgoing edges
		proto.destroy = function() {
			this.incomingEdges.forEach(function(edge) {
				var fromNode = edge.fromNode;
				fromNode.removeOutgoingEdge(edge);
			});

			this.outgoingEdges.forEach(function(edge) {
				var toNode = edge.toNode;
				toNode.removeIncomingEdge(edge);
			});

			clear(this.incomingEdges);
			clear(this.outgoingEdges);
			delete this.obj.__cjs_cs_node__;
		};

		proto.getEdgeTo = function(toNode) {
			var i = index_where(this.outgoingEdges, function(edge) {
				return edge.toNode === toNode;
			});

			if(i < 0) { return null; }
			else { return this.outgoingEdges[i]; }
		};
		proto.hasEdgeTo = function(toNode) { return this.getEdgeTo(toNode)!==null; };
	}(ConstraintNode));

	var ConstraintEdge = function(fromNode, toNode) {
		this.fromNode = fromNode;
		this.toNode = toNode;
		this.timestamp = 0;
	};

	var ConstraintSolver = function() {
		this.stack = [];
		this.nullified_call_stack = [];
		if(__debug) { this.nullified_reasons = []; }
		this.running_nullified_listeners = false;
		this.semaphore = 0;
	};
	(function(my) {
		var proto = my.prototype;

		proto.getNode = function(obj) { return obj.__cjs_cs_node__ || null; };
		proto.hasNode = function(obj) { return this.getNode(obj)!==null; };
		proto.add = function(obj, options) { return this.getNode(obj) || new ConstraintNode(obj, options); };

		proto.removeObject = function(obj) {
			var node = this.getNode(obj);
			if(node!==null) {
				this.removeNode(node);
			}
		};
		proto.removeNode = function(node) {
			node.destroy();
		};

		proto.getNodeDependency = function(fromNode, toNode) { return this.getEdge(fromNode, toNode); };
		proto.addNodeDependency = function(fromNode, toNode) { return this.addEdge(new ConstraintEdge(fromNode, toNode)); };

		proto.removeNodeDependency = function(edge) { this.removeEdge(edge); };

		proto.nullifyNode = function(node) {
			var i, j, outgoingEdges;
			var to_nullify = [node];
			for(i = 0; i<to_nullify.length; i++) {
				var curr_node = to_nullify[i];
				if(curr_node.is_valid()) {
					curr_node.mark_invalid();

					var nullification_listeners = this.get_nullification_listeners(curr_node);
					this.nullified_call_stack.push.apply(this.nullified_call_stack, nullification_listeners);
					if(__debug) {
						this.nullified_reasons.push.apply(this.nullified_reasons, map(nullification_listeners, function() { return curr_node; }));
					}

					var outgoingEdges = curr_node.getOutgoing();
					for(j = 0; j<outgoingEdges.length; j++) {
						var outgoingEdge = outgoingEdges[j];
						var dependentNode = outgoingEdge.toNode;
						if(outgoingEdge.timestamp < dependentNode.timestamp) {
							this.removeEdge(outgoingEdge);
							j--;
						} else {
							to_nullify.push(dependentNode);
						}
					}
				}
			}
			if(this.semaphore >= 0) {
				this.run_nullified_listeners();
			}
		};

		proto.run_nullified_listeners = function() {
			if(!this.running_nullified_listeners) {
				this.running_nullified_listeners = true;
				while(this.nullified_call_stack.length > 0) {
					var nullified_callback = this.nullified_call_stack.pop();
					if(__debug) { var nullified_reason = this.nullified_reasons.pop(); }
					nullified_callback();
				}
				this.running_nullified_listeners = false;
			}
		};

		proto.getValue = function(obj) { return this.getNodeValue(this.getNode(obj)); };

		proto.getNodeValue = function(node) {
			var demanding_var = last(this.stack);

			if(demanding_var) {
				var dependency_edge = this.getNodeDependency(node, demanding_var);
				if(!dependency_edge) {
					if(node.options.auto_add_outgoing_dependencies && demanding_var.options.auto_add_incoming_dependencies) {
						dependency_edge = this.addNodeDependency(node, demanding_var);
					}
				}
				if(dependency_edge!==null) {
					dependency_edge.timestamp = demanding_var.timestamp+1;
				}
			}

			if(!node.is_valid()) {
				this.stack.push(node);
				this.doEvalNode(node);
				this.stack.pop();
			}

			return node.value;
		};

		proto.doEvalNode = function(node) {
			node.mark_valid();
			node.update_value();
			node.timestamp++;
		};
		proto.doEval = function(obj) { return this.doEvalNode(this.getNode(obj)); };

		proto.on_nullify = function(arg0, callback) {
			var node = arg0 instanceof ConstraintNode ? arg0 : this.getNode(arg0);
			node.onNullify(callback);
		};

		proto.off_nullify = function(arg0, callback) {
			var node = arg0 instanceof ConstraintNode ? arg0 : this.getNode(arg0);
			node.offNullify(callback);
			do {
				ri = remove(this.nullified_call_stack, callback);
				if(__debug) {
					if(ri >= 0) {
						this.nullified_reasons.splice(ri, 1);
					}
				}
			} while (ri >= 0);
		};

		proto.get_nullification_listeners = function(arg0) {
			var node = arg0 instanceof ConstraintNode ? arg0 : this.getNode(arg0);
			return node.nullificationListeners;
		};

		proto.getEdge = function(fromNode, toNode) {
			return fromNode.getEdgeTo(toNode);
		};

		proto.addEdge = function(edge){
			edge.fromNode.addOutgoingEdge(edge);
			edge.toNode.addIncomingEdge(edge);
			return edge;
		};

		proto.removeEdge = function(edge) {
			if(edge!=null) {
				edge.fromNode.removeOutgoingEdge(edge);
				edge.toNode.removeIncomingEdge(edge);
			}
		};

		proto.wait = function() {
			this.semaphore--;
		};
		proto.signal = function() {
			this.semaphore++;
			if(this.semaphore >= 0) {
				this.run_nullified_listeners();
			}
		};
	}(ConstraintSolver));

	return new ConstraintSolver();
}());

cjs.wait = function() {
	constraint_solver.wait();
};
cjs.signal = function() {
	constraint_solver.signal();
};

//
// ============== CORE CONSTRAINTS ============== 
//

var Constraint = function(value, literal) {
	var node = constraint_solver.add(this);
	this.value = value;
	this.literal = literal === true;
	this._equality_check = eqeqeq;
	this.invalidate = function() {
		constraint_solver.nullifyNode(node);
	};
	this._change_listeners = [];
};

(function(my) {
	var proto = my.prototype;
	proto.destroy = function() { constraint_solver.removeObject(this); };
	proto.set_equality_check = function(equality_check) { this._equality_check = equality_check; return this; };
	proto.cjs_getter = function() {
		if(has(this, "value")) {
			if(isFunction(this.value) && !this.literal){
				return this.value();
			} else {
				return this.value;
			}
		}
		return undefined;
	};
	proto.get = function() { return constraint_solver.getValue(this); };
	proto.onChange = function(callback) {
		var self = this;
		var listener = {
			callback: callback
			, on_nullify: function() {
				callback(self.get());
			}
		};
		constraint_solver.on_nullify(this, listener.on_nullify);
		this.get();
		this._change_listeners.push(listener);
		return this;
	};
	proto.offChange = function(callback) {
		each(this._change_listeners, function(listener) {
			if(listener.callback === callback) {
				constraint_solver.off_nullify(this, listener.on_nullify);
			}
		});
		this._change_listeners = filter(this._change_listeners, function(listener) {
			return listener.callback !== callback;
		});
		return this;
	};
}(Constraint));
cjs.Constraint = Constraint;

var SettableConstraint = function() {
	SettableConstraint.superclass.constructor.apply(this, arguments);
};

(function(my) {
	proto_extend(my, Constraint);
	var proto = my.prototype;
	proto.set = function(value, literal) {
		var was_literal = this.literal;
		var old_value = this.value;

		this.literal = literal === true;
		this.value = value;
		
		if(!this._equality_check(was_literal, this.literal) || !this._equality_check(old_value !== this.value)) {
			this.invalidate();
		}
		return this;
	};
}(SettableConstraint));
cjs.SettableConstraint = SettableConstraint;

cjs.is_constraint = cjs.is_$ = function(obj) {
	return obj instanceof Constraint;
};

cjs.get = function(obj, recursive) {
	if(cjs.is_$(obj) || obj instanceof ArrayConstraint) {
		if(recursive === true) {
			return cjs.get(obj.get(), true);
		} else {
			return obj.get();
		}
	} else {
		if(recursive === true && isArray(obj)) {
			return map(obj, function(x) { return cjs.get(x, true); });
		} else {
			return obj;
		}
	}
};

cjs.$ = function(arg0, arg1) {
	return new SettableConstraint(arg0, arg1);
};

cjs.$.extend = function(arg0, arg1) {
	var values;
	if(isString(arg0)) {
		values = {};
		values[arg0] = arg1;
	} else {
		values = arg0;
	}

	each(values, function(value, key) {
		Constraint.prototype[key] = value;
	});
};
//
// ============== LIVEN ============== 
//

cjs.liven = function(func, options) {
	options = extend({
		context: this
		, run_on_create: true
		, pause_while_running: false
	}, options);

	var node = constraint_solver.add({
		cjs_getter: function() {
			func.call(options.context);
		},
		auto_add_outgoing_dependencies: false,
		cache_value: false
	});

	var destroy = function() {
		constraint_solver.off_nullify(node, do_get);
		constraint_solver.removeObject(node);
	};
	var pause = function() {
		constraint_solver.off_nullify(node, do_get);
		return this;
	};
	var resume = function() {
		constraint_solver.on_nullify(node, do_get);
		return this;
	};
	var run = function() {
		do_get();
		return this;
	};

	var do_get = function() {
		if(options.pause_while_running) {
			pause();
		}
		constraint_solver.getNodeValue(node);
		if(options.pause_while_running) {
			resume();
		}
	};

	constraint_solver.on_nullify(node, do_get);
	if(options.run_on_create !== false) {
		constraint_solver.nullified_call_stack.push(do_get);
		if(__debug) { constraint_solver.nullified_reasons.push("liven start"); }

		if(constraint_solver.semaphore >= 0) {
			constraint_solver.run_nullified_listeners();
		}
	}

	return {
		destroy: destroy
		, pause: pause
		, resume: resume
		, run: run
	};
};


//
// ============== ARRAYS ============== 
//

var ArrayConstraint = function(value) {
	this._value = [];
	this._unsubstantiated_items = [];
	if(isArray(value)) {
		var i, len = value.length;
		for(i = 0; i<value.length; i++) {
			var val = value[i];
			this._value.push(cjs.$(val, true));
		}
	}
	this._len = cjs.$(this._value.length);
	this._equality_check = eqeqeq;
	var self = this;
	this.$value = new Constraint(function() {
		return self._getter();
	});
	this._add_listeners = [];
	this._remove_listeners = [];
	this._move_listeners = [];
	this._index_change_listeners = [];
	this._semaphore = 0;
};

(function(my) {
	var proto = my.prototype;
	proto.set_equality_check = function(equality_check) { this._equality_check = equality_check; return this; };

	var diff_events = {
		"Add": "_add_listeners",
		"Remove": "_remove_listeners",
		"Move": "_move_listeners",
		"IndexChange": "_index_change_listeners"
	};
	each(diff_events, function(arr_name, diff_event) {
		proto["on" + diff_event] = function(callback) {
			var listener_info = {
				callback: callback
				, init_value: this.get()
			};
			var arr = this[arr_name];
			arr.push(listener_info);
			return this;
		};
		proto["off" + diff_event] = function(callback) {
			var arr = this[arr_name];

			var listener_index = index_where(arr, function(listener_info) {
				return listener_info.callback === callback;
			});

			if(listener_index >= 0) {
				delete arr[listener_index];
				arr.splice(listener_index, 1);
			}

			return this;
		};
	});

	proto.each = function(callback, context) {
		context = context || this;
		each(this.get(), callback);
		return this;
	};
	proto._uninstall_diff_listener = function() {
		this.$value.offChange(this._diff_listener_id);
	};
	proto.destroy = function() {
		this._uninstall_diff_listener();
		this.$value.destroy();
		this._len.destroy();
	};
	proto.onChange = function(callback) {
		return this.$value.onChange.apply(this.$value, arguments);
	};
	proto.offChange = function(callback) {
		this.$value.offChange.apply(this.$value, arguments);
	};
	proto.item = function(key, arg1) {
		var val;
		if(arguments.length === 1) {
			val = this._value[key];
			if(val === undefined) {
				// Create a dependency so that if the value for this key changes
				// later on, we can detect it in the constraint solver
				val = cjs.$(undefined);
				this._unsubstantiated_items[key] = val;
			}
			return val.get();
		} else if(arguments.length > 1) {
			val = arg1;
			var $previous_value = this._value[key];
			if($previous_value === undefined) {
				if(has(this._unsubstantiated_items, key)) {
					$previous_value = this._unsubstantiated_items[key];
					delete this._unsubstantiated_items[key];
				}
			}

			if(cjs.is_constraint($previous_value)) {
				$previous_value.set(val);
			} else {
				this._value[key] = cjs.$(val, true);
			}
			this._update_len();
			return this;
		}
	};
	proto.length = function() {
		return this._len.get();
	};
	proto.push = function() {
		var i, len = arguments.length;
		//Make operation atomic
		cjs.wait();
		for(i = 0; i<len; i++) {
			this.item(this._value.length, arguments[i]);
		}
		cjs.signal();
		return arguments.length;
	};
	proto.pop = function() {
		cjs.wait();
		var $value = this._value.pop();
		var rv = undefined;
		if(cjs.is_constraint($value)) {
			rv = $value.get();
			$value.destroy();
		}
		this._update_len();
		cjs.signal();
		return rv;
	};
	proto.clear = function() {
		var $val;
		cjs.wait();
		while(this._value.length > 0) {
			$val = this._value.pop();
			if(cjs.is_constraint($val)) { $val.destroy(); }
		}
		cjs.signal();
	};
	proto.set = function(arr) {
		cjs.wait();
		this.clear();
		this.push.apply(this, arr);
		cjs.signal();
		return this;
	};
	proto._getter = function() {
		var i, len = this.length();
		var rv = [];
		for(i = 0; i<len; i++) {
			rv.push(this.item(i));
		}
		return rv;
	};
	proto.get = function() {
		return this.$value.get();
	};
	proto._update_len = function() {
		this._len.set(this._value.length);
	};
	proto.indexWhere = function(filter) {
		var i, len = this._value.length, $val;

		for(i = 0; i<len; i++) {
			$val = this._value[i];
			if(filter($val.get())) {
				return i;
			}
		}
		this.length(); // We want to depend on the length if 

		return -1;
	};
	proto.lastIndexWhere = function(filter) {
		var i, len = this.length(), $val;

		for(i = len-1; i>=0; i--) {
			$val = this._value[i];
			if(filter($val.get())) { return i; }
		}
		return -1;
	};
	proto.indexOf = function(item, equality_check) {
		equality_check = equality_check || this._equality_check;
		var filter = function(x) { return equality_check(x, item); };
		return this.indexWhere(filter);
	};
	proto.lastIndexOf = function(item, equality_check) {
		equality_check = equality_check || this._equality_check;
		var filter = function(x) { return equality_check(x, item); };
		return this.lastIndexWhere(filter);
	};
	var isPositiveInteger = function(val) {
		return isNumber(val) && Math.round(val) === val && val >= 0;
	};
	proto.splice = function(index, howmany) {
		var i;
		if(!isNumber(howmany)) { howmany = 0; }
		if(!isPositiveInteger(index) || !isPositiveInteger(howmany)) {
			throw new Error("index and howmany must be positive integers");
		}
		var to_insert = Array.prototype.slice.call(arguments, 2);

		cjs.wait();
		var resulting_shift_size = to_insert.length - howmany;
		var removed = [];

		for(i = index; i<index+howmany; i++) {
			removed.push(this.item(i));
		}

		if(resulting_shift_size < 0) {
			for(i = index; i<this._value.length + resulting_shift_size; i++) {
				if(i < index + to_insert.length) {
					this.item(i, to_insert[i-index]);
				} else {
					this.item(i, this.item(i - resulting_shift_size));
				}
			}
			for(i = 0; i<-resulting_shift_size; i++) {
				this.pop();
			}
		} else {
			for(i = this._value.length + resulting_shift_size - 1; i>=index; i--) {
				if(i-index < to_insert.length) {
					this.item(i, to_insert[i-index]);
				} else {
					this.item(i, this.item(i - resulting_shift_size));
				}
			}
		}

		this._update_len();
		cjs.signal();
		return removed;
	};
	proto.concat = function() {
		var args = [], i, len = arguments.length;
		for(i = 0; i<len; i++) {
			var arg = arguments[i];
			if(arg instanceof ArrayConstraint) {
				args.push(arg.get());
			} else {
				args.push(arg);
			}
		}
		var my_val = this.get();
		return my_val.concat.apply(my_val, args);
	};
	proto.shift = function() { var rv_arr = this.splice(0, 1); return rv_arr[0]; };
	proto.unshift = function() {
		var args = Array.prototype.slice.call(arguments, 0);
		this.splice.apply(this, ([0, 0]).concat(args));
		return this._value.length;
	};
	proto.join = function() { var my_val = this.get(); return my_val.join.apply(my_val, arguments); };
	proto.slice = function() { var my_val = this.get(); return my_val.slice.apply(my_val, arguments); };
	proto.sort = function() { var my_val = this.get(); return my_val.sort.apply(my_val, arguments); };
	proto.reverse = function() { var my_val = this.get(); return my_val.reverse.apply(my_val, arguments); };
	proto.valueOf = function() { var my_val = this.get(); return my_val.valueOf.apply(my_val, arguments); };
	proto.toString = function() { var my_val = this.get(); return my_val.toString.apply(my_val, arguments); };
	proto.wait = function() {
		this._semaphore--;
	};
	proto.signal = function() {
		this._semaphore++;
	};
}(ArrayConstraint));

cjs.array = function(value) { return new ArrayConstraint(value); };
cjs.is_array = function(obj) { return obj instanceof ArrayConstraint; };
cjs.ArrayConstraint = ArrayConstraint;

//
// ============== MAPS ============== 
//

var defaulthash = function(key) { return ""+key; };
var MapConstraint = function(options) {
	options = extend({
		hash: defaulthash,
		equals: eqeqeq,
	}, options);
	this._equality_check = options.equals;
	this._hash = options.hash;
	this._values = {};
	this._unsubstantiated_items = {};
	this._ordered_values = [];
	this._semaphore = 0;
	this._queued_events = [];
  
	this._add_listeners();
	this.__running_listeners = false;

	this.$_do_get_keys = bind(this._do_get_keys, this);
	this.$_do_get_values = bind(this._do_get_values, this);
	this.$_do_get_entries = bind(this._do_get_entries, this);
	this.$_do_get_size = bind(this._do_get_size, this);
	this.$keys = cjs.$(bind(this._do_get_keys, this));
	this.$values = cjs.$(bind(this.$_do_get_values);
	this.$entries = cjs.$(bind(this.$_do_get_entries);
	this.$size = cjs.$(bind(this.$_do_get_size);
};

(function(my) {
	var proto = my.prototype;

	var index_change_event_str = "index_change"; // value, key, to, from
	var put_event_str = "put"; // value, key, index
	var remove_event_str = "remove"; // value, key, index
	var key_change_event_str = "key_change"; // value, to_key, from_key, from_key, index
	var value_change_event_str = "value_change"; // to_value, key, from_value, index
	var move_event_str = "move"; // value, key, to_index, from_index

	var diff_events = {
		"Put":  put_event_str,
		"Remove":  remove_event_str,
		"KeyChange":  key_change_event_str,
		"ValueChange":  value_change_event_str,
		"IndexChange":  index_change_event_str,
		"Move":  move_event_str
	};
	proto._add_listeners = function() {
		var listeners = this._listeners = {};
		each(diff_events, function(arr_name, diff_event) {
			listeners[arr_name] = [];
		});
	};
	each(diff_events, function(arr_name, diff_event) {
		proto["on" + diff_event] = function(callback, context) {
			var listener_info = {
				callback: callback,
				context: context || this
			};
			var arr = this._listeners[arr_name];
			arr.push(listener_info);
			return this;
		};
		proto["off" + diff_event] = function(callback) {
			var arr = this._listeners[arr_name];

			var listener_index = index_where(arr, function(listener_info) {
				return listener_info.callback === callback;
			});

			if(listener_index >= 0) {
				delete arr[listener_index];
				arr.splice(listener_index, 1);
			}

			return this;
		};
	});

	proto._find_key = function(key) {
		var hash = this._hash(key);
		var rv = {
			hv: false
			, i: -1
			, h: hash
		};

		var hash_values = this._values[hash];
		if(isArray(hash_values)) {
			var eq = this._equality_check;
			var key_index = index_where(hash_values, function(a, b) {
				return eq(a.key.get(), key);
			});
			rv.hv = hash_values;
			rv.i = key_index;
		}
		return rv;
	};
	proto._do_set_item_ki = function(key_index, hash_values, hash, key, value, index) {
		if(!hash_values) {
			hash_values = this._values[hash] = [];
		}

		var info;
		if(key_index >= 0) {
			info = hash_values[key_index];
			var old_value = info.value.get();
			info.value.set(value, true);
			this._queued_events.push(value_change_event_str, info.value, info.key, old_value, info.index);
		} else {
			if(!isNumber(index) || index < 0) {
				index = this._ordered_values.length;
			}
			info = {
				key: cjs.$(key, true),
				value: cjs.$(value, true),
				index: cjs.$(index, true)
			};
			hash_values.push(info);
			this._ordered_values.splice(index, 0, info);
			this._queued_events.push(put_event_str, value, key, index);
			for(var i = index + 1; i<this._ordered_values.length; i++) {
				this._set_index(this._ordered_values[i], i);
			}
			this.$keys.invalidate();
			this.$values.invalidate();
			this.$entries.invalidate();
		}
	};

	proto._set_index = function(info, to_index) {
		var old_index = info.index.get;
		info.index.set(to_index);
		this._queued_events.push(index_change_event_str, info.value, info.key, info.index, old_index);
	};
	proto._remove_index = function(index) {
		var info = this._ordered_values[index];
		info.key.destroy();
		info.value.destroy();
		info.index.destroy();
		this._ordered_values.splice(index, 1);
		this._queued_events.push(remove_event_str, info.value.get(), info.key.get(), info.index.get());
	};

	proto.put = function(key, value, index) {
		cjs.wait();
		this.wait();
		var ki = this._find_key(key);
		var key_index = ki.i,
			hash_values = ki.hv,
			hash = ki.h;
		this._do_set_item_ki(key_index, hash_values, hash, key, value, index);
		this.signal();
		cjs.signal();
		return this;
	};
	proto.remove = function(key) {
		var ki = this._find_key(key);
		var key_index = ki.i,
			hash_values = ki.hv;
		if(key_index >= 0) {
			cjs.wait();
			this.wait();
			hash_values.splice(key_index, 1);
			if(hash_values.length === 0) {
				delete hash_values[key_index]
			}

			var info = hash_values[key_index];
			var ordered_index = info.index.get();

			this._remove_index(ordered_index);
			for(var i = ordered_index; i<this._ordered_values.length; i++) {
				this._set_index(this._ordered_values[i], i);
			}

			this.$keys.invalidate();
			this.$values.invalidate();
			this.$entries.invalidate();

			this.signal();
			cjs.signal();
		}
		return this;
	};
	proto.get = function(key) {
		var ki = this._find_key(key);
		var key_index = ki.i,
			hash_values = ki.hv;
		if(key_index >= 0) {
			var info = hash_values[key_index];
			return info.value.get();
		}
		return undefined;
	};
	proto.keys = function() {
		return this.$keys.get();
	};
	proto._do_get_keys = function() {
		var rv = [];
		this.each(function(value, key) {
			rv.push(key);
		});
		return rv;
	};
	proto.clear = function() {
		if(this._do_get_size() > 0) {
			cjs.wait();
			this.wait();
			while(this._ordered_values.length > 0) {
				this._remove_index(0);
			}
			each(this._values, function(arr, hash) {
				delete this._values[hash];
			});

			this.$keys.invalidate();
			this.$values.invalidate();
			this.$entries.invalidate();
			this.$size.invalidate();

			this.signal();
			cjs.signal();
		}
		return this;
	};
	proto.values = function() {
		return this.$values.get();
	};
	proto._do_get_values = function() {
		var rv = [];
		this.each(function(value, key) {
			rv.push(value);
		});
		return rv;
	};
	proto._do_get_size = function() {
		return this._ordered_values.length; 
	};
	proto.size = function() {
		return this.$size.get();
	};
	proto.entries = function() {
		return this.$entries.get();
	};
	proto._do_get_entries = function() {
		var rv = [];
		this.each(function(value, key) {
			rv.push({key: key, value: value});
		});
		return rv;
	};
	proto.each = function(func, context) {
		context = context || root;
		for(var i = 0; i<this._ordered_values.lenth; i++) {
			var info = this._ordered_values[i];
			if(info) {
				if(func.call(context, info.value.get(), info.key.get(), info.index.get()) === false) {
					break;
				}
			}
		}
	};
	proto.set_equality_check = function(equality_check) {
		this._equality_check = equality_check;
		return this;
	};
	proto.item = function(arg0, arg1, arg2) {
		if(arguments.length === 1) {
			return this.get(arg0);
		} else if(arguments.length >= 2) {
			this.put(arg0, arg1, arg2);
		}
		return this;
	};
	proto.item_or_append = function(key, create_fn, create_fn_context) {
		var ki = this._find_key(key);
		var key_index = ki.i,
			hash_values = ki.hv,
			hash = ki.h;
		if(key_index >= 0) {
			var info = hash_values[key_index];
			return info.value;
		} else {
			cjs.wait();
			this.wait();
			var context = create_fn_context || root;
			var value = create_fn.call(context);
			this._do_set_item_ki(key_index, hash_values, hash, key, value);
			this.signal();
			cjs.signal();
			return value;
		}
	};
	proto.has = proto.containsKey = function(key) {
		var ki = this._find_key(key);
		var key_index = ki.i;
		return key_index >= 0;
	};
	proto.containsValue = function(value, eq_check) {
		eq_check = eq_check || eqeqeq;
		var rv = false;
		this.each(function(v, k) {
			if(eq_check(value, v)) {
				rv = true;
				return false;
			}
		});
		return rv;
	};
	proto.move_index = function(old_index, new_index) {
		cjs.wait();
		this.wait();
		var info = this._ordered_values[old_index];
		this._ordered_values.splice(old_index, 1);
		this._ordered_values.splice(new_index, 0, info);
		this._queued_events.push(move_event_str, info.value.get(), info.key.get(), new_index, old_index);

		var low = Math.min(old_index, new_index);
		var high = Math.max(old_index, new_index);
		for(var i = low; i<= high; i++) {
			this._set_index(this._ordered_values[i], i);
		}
		this.$keys.invalidate();
		this.$values.invalidate();
		this.$entries.invalidate();
		this.signal();
		cjs.signal();
		return this;
	};
	proto.move = function(key, index) {
		var ki = this._find_key(key);
		var key_index = ki.i;
		if(key_index >= 0) {
			this.move_index(key_index, index);
		}
		return this;
	};
	proto.rename = function(old_key, new_key) {
		var ki = this._find_key(key);
		var key_index = ki.i,
			hash_values = ki.hv,
			hash = ki.h;
		if(key_index >= 0) {
			cjs.wait();
			this.wait();
			var new_hash = this._hash(new_key);
			if(new_hash !== hash) {
				hash_values.splice(key_index, 1);
				var new_hash_values = this._values[new_hash];
				if(!isArray(new_hash_values)) {
					new_hash_values = this._values[new_hash] = [];
				}
				new_hash_values.push(info);
			}

			var info = hash_values[key_index];
			info.key.set(new_key);

			this._queued_events.push(key_change_event_str, info.value.get(), info.key.get(), old_key, info.index.get());
			this.$keys.invalidate();
			this.$entries.invalidate();
			this.signal();
			cjs.signal();
		}
		return this;
	};
	proto.keyForValue = function(value, eq_check) {
		eq_check = eq_check || eqeqeq;
		var key;
		this.each(function(v, k) {
			if(eq_check(value, v)) {
				key = k;
				return false;
			}
		});
		return key;
	};
	proto.isEmpty = function() {
		return this.size() === 0;
	};
	proto.wait = function() {
		this._semaphore--;
	};
	proto.signal = function() {
		this._semaphore++;
		if(this.semaphore >= 0 && !this.__running_listeners) {
			this.__running_listeners = true;
			this._run_listeners();
			this.__running_listeners = false;
		}
	};
	proto._run_listeners = function() {
		var queued_events = this._queued_events;
		while(queued_events.length > 0) {
			var queued_event = queued_events.shift();
			var type = queued_event.shift();
			var listeners = this._listeners[type];
			each(listeners, function(listener_info) {
				var callback = listener_info.callback;
				var context = listener_info.context;
				callback.apply(context, queued_event);
			});
		}
	};
	proto.destroy = function() {
		this.wait();
		cjs.wait();
		this.clear();
		this.$keys.destroy();
		this.$values.destroy();
		this.$entries.destroy();
		cjs.signal();
		this.signal();
	};
}(MapConstraint));

cjs.map = function(arg0, arg1) { return new MapConstraint(arg0, arg1); };
cjs.is_map = function(obj) { return obj instanceof MapConstraint; };
cjs.MapConstraint = MapConstraint;
if(__debug) { cjs._constraint_solver = constraint_solver; }

return cjs;
}(this));
